import React, { useEffect, useRef } from "react";
import { useKeyboard } from "@opentui/react";
import { COLORS } from "../theme.js";
import type { CpuRank } from "../../cpu/types.js";
import { CPU_RANK_INFO } from "../../cpu/types.js";
import { BoardView } from "../components/board-view.js";
import { ScoreBar } from "../components/score-bar.js";
import { TurnIndicator } from "../components/turn-indicator.js";
import { GameLog } from "../components/game-log.js";
import { useGame } from "../hooks/use-game.js";
import type { MatchResult } from "../../game/types.js";
import type { Board } from "../../types.js";

interface BattleSceneProps {
  rank: CpuRank;
  code: string;
  onResult: (result: MatchResult, board: Board, rank: CpuRank, code: string) => void;
  onQuit: () => void;
}

export function BattleScene({ rank, code, onResult, onQuit }: BattleSceneProps) {
  const { state: gameState, deploy, abort } = useGame();
  const deployedRef = useRef(false);

  // Auto-deploy on mount
  useEffect(() => {
    if (!deployedRef.current) {
      deployedRef.current = true;
      deploy(code, rank);
    }
  }, [code, rank, deploy]);

  useEffect(() => {
    if (gameState.isFinished && gameState.result) {
      const timer = setTimeout(() => {
        onResult(gameState.result!, gameState.board, rank, code);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isFinished, gameState.result, rank, code, onResult]);

  useKeyboard((key) => {
    if (key.ctrl && key.name === "q") {
      if (!gameState.isRunning) {
        abort();
        onQuit();
      }
      return;
    }
  });

  return (
    <box flexDirection="column">
      <box flexDirection="row">
        {/* Left panel: Board */}
        <box flexDirection="column" width={36} marginRight={2}>
          <BoardView
            board={gameState.board}
            validMoves={gameState.validMoves}
            lastMove={gameState.lastMove}
            flippedCells={gameState.flippedCells}
            currentPlayer={gameState.currentPlayer ?? undefined}
          />
          <box flexDirection="row" marginTop={1}>
            <ScoreBar
              blackScore={gameState.blackScore}
              whiteScore={gameState.whiteScore}
              currentPlayer={gameState.currentPlayer}
            />
          </box>
          <box flexDirection="row" marginTop={1}>
            <TurnIndicator
              currentPlayer={gameState.currentPlayer}
              isThinking={gameState.isThinking}
              turnNumber={gameState.turnNumber}
            />
          </box>
        </box>

        {/* Right panel: Game log */}
        <box flexDirection="column" flexGrow={1}>
          <GameLog entries={gameState.logs} maxLines={Math.max(8, process.stdout.rows - 6)} />
        </box>
      </box>

      {/* Bottom: Status */}
      <text fg={COLORS.muted}>{"─".repeat(60)}</text>
      <box flexDirection="row" gap={2}>
        <text><b fg={COLORS.accent}>VS {CPU_RANK_INFO[rank].title}</b></text>
        {gameState.isRunning && (
          <text fg={COLORS.success}>[Running]</text>
        )}
        {gameState.isFinished && (
          <text fg={COLORS.info}>[Finished]</text>
        )}
        {gameState.errorMessage && (
          <text fg={COLORS.error}>[Error]</text>
        )}
      </box>
      {gameState.errorMessage && (
        <text fg={COLORS.error}>
          {gameState.errorMessage.slice(0, 60)}
        </text>
      )}
      <box flexDirection="row" gap={2}>
        <text fg={COLORS.muted}>Ctrl+Q: Quit</text>
      </box>
    </box>
  );
}
