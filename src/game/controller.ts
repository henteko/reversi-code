import type { Board, PlayerColor, Position } from "../types.js";
import { opponentColor } from "../types.js";
import type { CpuRank } from "../cpu/types.js";
import type { CpuStrategy } from "../cpu/types.js";
import { getCpuStrategy } from "../cpu/index.js";
import { createBoard } from "../engine/board.js";
import { getValidMoves, applyMove, isGameOver, isValidMove } from "../engine/rules.js";
import { countStones, getWinner } from "../engine/score.js";
import { executePlayerCode } from "../sandbox/index.js";
import type { GameEvent, MatchResult } from "./types.js";

const TURN_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* runGame(
  playerCode: string,
  cpuRank: CpuRank,
): AsyncGenerator<GameEvent> {
  const cpu: CpuStrategy = getCpuStrategy(cpuRank);
  let board: Board = createBoard();
  const playerColor: PlayerColor = "black";
  const cpuColor: PlayerColor = "white";
  let turnNumber = 0;

  yield { type: "game-start", board, cpuRank };

  while (!isGameOver(board)) {
    const currentPlayer: PlayerColor = turnNumber % 2 === 0 ? playerColor : cpuColor;
    const moves = getValidMoves(board, currentPlayer);

    if (moves.length === 0) {
      yield { type: "pass", player: currentPlayer };
      turnNumber++;
      continue;
    }

    yield { type: "turn-start", board, player: currentPlayer, turnNumber };

    if (currentPlayer === playerColor) {
      // Player turn via sandbox
      const result = await executePlayerCode(playerCode, board, playerColor);

      if (!result.ok) {
        yield {
          type: "player-error",
          error: result.error,
          errorType: result.errorType,
        };
        // Forfeit on error
        const stones = countStones(board);
        yield {
          type: "game-end",
          board,
          result: {
            winner: cpuColor,
            blackScore: stones.black,
            whiteScore: stones.white,
            forfeit: true,
            totalTurns: turnNumber,
          },
        };
        return;
      }

      // Validate the move is legal
      if (!isValidMove(board, result.move, playerColor)) {
        yield {
          type: "player-error",
          error: `Invalid move: [${result.move}] is not a legal position`,
          errorType: "invalid-move",
        };
        const stones = countStones(board);
        yield {
          type: "game-end",
          board,
          result: {
            winner: cpuColor,
            blackScore: stones.black,
            whiteScore: stones.white,
            forfeit: true,
            totalTurns: turnNumber,
          },
        };
        return;
      }

      const moveResult = applyMove(board, result.move, playerColor);
      board = moveResult.board;
      yield {
        type: "move-made",
        board,
        player: playerColor,
        position: result.move,
        flipped: moveResult.flipped,
        executionTimeMs: result.executionTimeMs,
      };
    } else {
      // CPU turn
      await delay(TURN_DELAY_MS);
      const start = Date.now();
      const move: Position = cpu.decideMove(board, cpuColor);
      const executionTimeMs = Date.now() - start;

      const moveResult = applyMove(board, move, cpuColor);
      board = moveResult.board;
      yield {
        type: "move-made",
        board,
        player: cpuColor,
        position: move,
        flipped: moveResult.flipped,
        executionTimeMs,
      };
    }

    turnNumber++;
    await delay(100); // Brief delay between turns
  }

  const stones = countStones(board);
  const winner = getWinner(board);
  const result: MatchResult = {
    winner,
    blackScore: stones.black,
    whiteScore: stones.white,
    forfeit: false,
    totalTurns: turnNumber,
  };

  yield { type: "game-end", board, result };
}
