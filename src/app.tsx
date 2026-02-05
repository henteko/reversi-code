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
import { BattleScene } from "./ui/scenes/battle.js";
import { ResultScene } from "./ui/scenes/result.js";
import { createBoard } from "./engine/board.js";

export function App() {
  const { exit } = useApp();
  const [phase, setPhase] = useState<GamePhase>("title");
  const [progress, setProgress] = useState<ProgressData>(loadProgress);
  const [selectedRank, setSelectedRank] = useState<CpuRank>("E");
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [lastBoard, setLastBoard] = useState<Board>(createBoard());
  const [unlockedRank, setUnlockedRank] = useState<CpuRank | null>(null);
  const [lastCode, setLastCode] = useState<string | undefined>(undefined);

  // Global quit handler
  useInput((input, key) => {
    // q on title, Ctrl+Q anywhere except battle (battle handles its own)
    if (input === "q" && phase === "title") {
      exit();
    }
    if (key.ctrl && input === "q" && phase !== "battle") {
      exit();
    }
  });

  const handleTitleStart = useCallback(() => {
    setPhase("rank-select");
  }, []);

  const handleRankSelect = useCallback((rank: CpuRank) => {
    setSelectedRank(rank);
    setPhase("battle");
  }, []);

  const handleRankBack = useCallback(() => {
    setPhase("title");
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
    setPhase("rank-select");
  }, []);

  const handleResultContinue = useCallback(() => {
    setPhase("rank-select");
    setUnlockedRank(null);
  }, []);

  const handleRematch = useCallback(() => {
    setPhase("battle");
    setUnlockedRank(null);
  }, []);

  switch (phase) {
    case "title":
      return <TitleScene onStart={handleTitleStart} />;

    case "rank-select":
      return (
        <RankSelectScene
          unlockedRanks={progress.unlockedRanks}
          onSelect={handleRankSelect}
          onBack={handleRankBack}
        />
      );

    case "battle":
      return (
        <BattleScene
          rank={selectedRank}
          initialCode={lastCode || progress.lastCode}
          onResult={handleBattleResult}
          onQuit={handleBattleQuit}
        />
      );

    case "result":
      return (
        <ResultScene
          board={lastBoard}
          result={lastResult!}
          rank={selectedRank}
          unlockedRank={unlockedRank}
          onContinue={handleResultContinue}
          onRematch={handleRematch}
        />
      );

    default:
      return <Box />;
  }
}
