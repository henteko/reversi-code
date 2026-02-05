import React, { useState, useCallback } from "react";
import { Box, useInput, useApp } from "ink";
import type { GamePhase } from "./types.js";
import type { Board } from "./types.js";
import type { CpuRank } from "./cpu/types.js";
import type { MatchResult } from "./game/types.js";
import { loadProgress, saveProgress, unlockNextRank, recordWin } from "./progress/store.js";
import type { ProgressData } from "./progress/types.js";
import { TitleScene } from "./ui/scenes/title.js";
import { RankSelectScene } from "./ui/scenes/rank-select.js";
import { EditorScene } from "./ui/scenes/editor.js";
import { BattleScene } from "./ui/scenes/battle.js";
import { ResultScene } from "./ui/scenes/result.js";
import { createBoard } from "./engine/board.js";
import { COLORS } from "./ui/theme.js";

export function App() {
  const { exit } = useApp();
  const [phase, setPhase] = useState<GamePhase>("title");
  const [progress, setProgress] = useState<ProgressData>(loadProgress);
  const [selectedRank, setSelectedRank] = useState<CpuRank>("E");
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [lastBoard, setLastBoard] = useState<Board>(createBoard());
  const [unlockedRank, setUnlockedRank] = useState<CpuRank | null>(null);
  const [lastCode, setLastCode] = useState<string | undefined>(undefined);
  const [compiledCode, setCompiledCode] = useState<string>("");

  // Global quit handler
  useInput((input, key) => {
    // q on title, Ctrl+Q anywhere except battle and editor (they handle their own)
    if (input === "q" && phase === "title") {
      exit();
    }
    if (key.ctrl && input === "q" && phase !== "battle" && phase !== "editor") {
      exit();
    }
  });

  const handleTitleStart = useCallback(() => {
    setPhase("rank-select");
  }, []);

  const handleRankSelect = useCallback((rank: CpuRank) => {
    setSelectedRank(rank);
    setPhase("editor");
  }, []);

  const handleRankBack = useCallback(() => {
    setPhase("title");
  }, []);

  const handleEditorStart = useCallback((code: string) => {
    setLastCode(code);
    setCompiledCode(code);
    setPhase("battle");
  }, []);

  const handleEditorBack = useCallback(() => {
    setPhase("rank-select");
  }, []);

  const handleBattleResult = useCallback(
    (result: MatchResult, board: Board, rank: CpuRank, code: string) => {
      setLastResult(result);
      setLastBoard(board);
      setLastCode(code);

      const updatedProgress = { ...progress };
      let newUnlockedRank: CpuRank | null = null;

      if (result.winner === "black") {
        recordWin(updatedProgress, rank);
        newUnlockedRank = unlockNextRank(updatedProgress, rank);
      }
      updatedProgress.lastCode = code;
      setProgress(updatedProgress);
      saveProgress(updatedProgress);
      setUnlockedRank(newUnlockedRank);
      setPhase("result");
    },
    [progress],
  );

  const handleBattleQuit = useCallback(() => {
    setPhase("editor");
  }, []);

  const handleResultContinue = useCallback(() => {
    setPhase("rank-select");
    setUnlockedRank(null);
  }, []);

  const handleRematch = useCallback(() => {
    setPhase("editor");
    setUnlockedRank(null);
  }, []);

  let scene: React.ReactNode;

  switch (phase) {
    case "title":
      scene = <TitleScene onStart={handleTitleStart} />;
      break;

    case "rank-select":
      scene = (
        <RankSelectScene
          unlockedRanks={progress.unlockedRanks}
          onSelect={handleRankSelect}
          onBack={handleRankBack}
        />
      );
      break;

    case "editor":
      scene = (
        <EditorScene
          rank={selectedRank}
          initialCode={lastCode || progress.lastCode}
          onStartBattle={handleEditorStart}
          onBack={handleEditorBack}
        />
      );
      break;

    case "battle":
      scene = (
        <BattleScene
          rank={selectedRank}
          code={compiledCode}
          onResult={handleBattleResult}
          onQuit={handleBattleQuit}
        />
      );
      break;

    case "result":
      scene = (
        <ResultScene
          board={lastBoard}
          result={lastResult!}
          rank={selectedRank}
          unlockedRank={unlockedRank}
          onContinue={handleResultContinue}
          onRematch={handleRematch}
        />
      );
      break;

    default:
      scene = null;
  }

  return (
    <Box backgroundColor={COLORS.appBg} width="100%">
      {scene}
    </Box>
  );
}
