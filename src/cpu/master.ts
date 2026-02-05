import type { Board, PlayerColor, Position } from "../types.js";
import { opponentColor } from "../types.js";
import type { CpuStrategy } from "./types.js";
import { getValidMoves } from "../engine/rules.js";
import { countStones } from "../engine/score.js";
import {
  boardToBitBoard,
  bitBoardToBoard,
  bbGetValidMoves,
  bbApplyMove,
  bbGetMoveList,
  bbCountStones,
  bbIsGameOver,
  type BitBoard,
} from "../engine/bitboard.js";
import { evaluateAdvanced } from "./evaluation.js";

const MIDGAME_DEPTH = 5;
const ENDGAME_THRESHOLD = 12; // remaining empty squares

function bbMinimax(
  bb: BitBoard,
  player: PlayerColor,
  maximizing: PlayerColor,
  depth: number,
  alpha: number,
  beta: number,
  emptyCount: number,
): number {
  if (depth === 0 || bbIsGameOver(bb)) {
    // In endgame with few squares left, do exact count
    if (emptyCount <= ENDGAME_THRESHOLD && depth === 0) {
      const stones = bbCountStones(bb);
      const myStones = maximizing === "black" ? stones.black : stones.white;
      const oppStones = maximizing === "black" ? stones.white : stones.black;
      return (myStones - oppStones) * 100;
    }
    return evaluateAdvanced(bitBoardToBoard(bb), maximizing);
  }

  const movesBits = bbGetValidMoves(bb, player);
  const next = opponentColor(player);

  if (movesBits === 0n) {
    // Pass
    return bbMinimax(bb, next, maximizing, depth - 1, alpha, beta, emptyCount);
  }

  const moves = bbGetMoveList(movesBits);

  if (player === maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBb = bbApplyMove(bb, move, player);
      const score = bbMinimax(newBb, next, maximizing, depth - 1, alpha, beta, emptyCount - 1);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBb = bbApplyMove(bb, move, player);
      const score = bbMinimax(newBb, next, maximizing, depth - 1, alpha, beta, emptyCount - 1);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export const masterStrategy: CpuStrategy = {
  rank: "S",
  name: "Master",
  decideMove(board: Board, color: PlayerColor): Position {
    const moves = getValidMoves(board, color);
    if (moves.length === 0) {
      throw new Error("No valid moves available");
    }

    const bb = boardToBitBoard(board);
    const stones = countStones(board);
    const emptyCount = 64 - stones.black - stones.white;

    // Deeper search in endgame
    const depth = emptyCount <= ENDGAME_THRESHOLD
      ? Math.min(emptyCount, 10)
      : MIDGAME_DEPTH;

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const newBb = bbApplyMove(bb, move, color);
      const score = bbMinimax(
        newBb,
        opponentColor(color),
        color,
        depth - 1,
        -Infinity,
        Infinity,
        emptyCount - 1,
      );
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  },
};
