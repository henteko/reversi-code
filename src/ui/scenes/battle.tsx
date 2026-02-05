import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { COLORS } from "../theme.js";
import { DEFAULT_PLAYER_CODE } from "../theme.js";
import type { CpuRank } from "../../cpu/types.js";
import { BoardView } from "../components/board-view.js";
import { ScoreBar } from "../components/score-bar.js";
import { TurnIndicator } from "../components/turn-indicator.js";
import { GameLog } from "../components/game-log.js";
import { CodeEditor } from "../components/code-editor.js";
import { StatusBar } from "../components/status-bar.js";
import { useEditor } from "../hooks/use-editor.js";
import { useGame } from "../hooks/use-game.js";
import type { MatchResult } from "../../game/types.js";
import type { Board } from "../../types.js";

interface BattleSceneProps {
  rank: CpuRank;
  initialCode?: string;
  onResult: (result: MatchResult, board: Board, rank: CpuRank, code: string) => void;
  onQuit: () => void;
}

export function BattleScene({ rank, initialCode, onResult, onQuit }: BattleSceneProps) {
  const [editorState, editorActions] = useEditor(initialCode || DEFAULT_PLAYER_CODE, 18);
  const { state: gameState, deploy, abort } = useGame();
  const [compileStatus, setCompileStatus] = useState<"idle" | "compiling" | "success" | "error">("idle");
  const editorIsActive = !gameState.isRunning;

  useEffect(() => {
    if (gameState.isFinished && gameState.result) {
      const timer = setTimeout(() => {
        onResult(gameState.result!, gameState.board, rank, editorActions.getCode());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isFinished, gameState.result, rank, editorActions, onResult]);

  useEffect(() => {
    if (gameState.errorMessage) {
      setCompileStatus("error");
    } else if (gameState.isRunning) {
      setCompileStatus("success");
    }
  }, [gameState.errorMessage, gameState.isRunning]);

  useInput((input, key) => {
    // Ctrl+D: Deploy (works in both normal and insert mode)
    if (key.ctrl && input === "d") {
      if (!gameState.isRunning) {
        setCompileStatus("compiling");
        const code = editorActions.getCode();
        deploy(code, rank);
      }
      return;
    }

    // Ctrl+R: Reset code
    if (key.ctrl && input === "r") {
      if (!gameState.isRunning) {
        editorActions.setCode(DEFAULT_PLAYER_CODE);
        setCompileStatus("idle");
      }
      return;
    }

    // :q in normal mode — quit when not running
    // We use Ctrl+Q as an alternative since : is hard to capture
    if (key.ctrl && input === "q") {
      if (!gameState.isRunning) {
        abort();
        onQuit();
      }
      return;
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        {/* Left panel: Board */}
        <Box flexDirection="column" width={36} marginRight={1}>
          <BoardView
            board={gameState.board}
            validMoves={gameState.validMoves}
            lastMove={gameState.lastMove}
            flippedCells={gameState.flippedCells}
            currentPlayer={gameState.currentPlayer ?? undefined}
          />
          <Box marginTop={1}>
            <ScoreBar
              blackScore={gameState.blackScore}
              whiteScore={gameState.whiteScore}
              currentPlayer={gameState.currentPlayer}
            />
          </Box>
          <Box marginTop={1}>
            <TurnIndicator
              currentPlayer={gameState.currentPlayer}
              isThinking={gameState.isThinking}
              turnNumber={gameState.turnNumber}
            />
          </Box>
          <Box marginTop={1}>
            <GameLog entries={gameState.logs} maxLines={6} />
          </Box>
        </Box>

        {/* Right panel: Editor */}
        <Box flexDirection="column" flexGrow={1}>
          <CodeEditor
            editorState={editorState}
            editorActions={editorActions}
            isActive={editorIsActive}
            visibleLines={18}
          />
        </Box>
      </Box>

      {/* Bottom: Status */}
      <StatusBar
        rank={rank}
        compileStatus={compileStatus}
        errorMessage={gameState.errorMessage}
        vimMode={editorState.mode}
      />
    </Box>
  );
}
