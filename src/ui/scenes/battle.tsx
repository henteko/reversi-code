import React, { useEffect, useRef } from "react";
import { Box, Text, useInput } from "ink";
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

  useInput((input, key) => {
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
        <Box flexDirection="column" width={36} marginRight={2}>
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
        </Box>

        {/* Right panel: Game log */}
        <Box flexDirection="column" flexGrow={1}>
          <GameLog entries={gameState.logs} maxLines={16} />
        </Box>
      </Box>

      {/* Bottom: Status */}
      <Text color={COLORS.muted}>{"─".repeat(60)}</Text>
      <Box gap={2}>
        <Text color={COLORS.accent} bold>
          VS {CPU_RANK_INFO[rank].title}
        </Text>
        {gameState.isRunning && (
          <Text color={COLORS.success}>[Running]</Text>
        )}
        {gameState.isFinished && (
          <Text color={COLORS.info}>[Finished]</Text>
        )}
        {gameState.errorMessage && (
          <Text color={COLORS.error}>[Error]</Text>
        )}
      </Box>
      {gameState.errorMessage && (
        <Text color={COLORS.error} wrap="truncate">
          {gameState.errorMessage}
        </Text>
      )}
      <Box gap={2}>
        <Text color={COLORS.muted}>Ctrl+Q: Quit</Text>
      </Box>
    </Box>
  );
}
