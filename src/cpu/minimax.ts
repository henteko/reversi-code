import type { Board, PlayerColor, Position } from "../types.js";
import { opponentColor } from "../types.js";
import type { CpuStrategy } from "./types.js";
import { getValidMoves, applyMove, isGameOver } from "../engine/rules.js";
import { evaluatePosition } from "./evaluation.js";

function minimax(
  board: Board,
  player: PlayerColor,
  maximizing: PlayerColor,
  depth: number,
  alpha: number,
  beta: number,
): number {
  if (depth === 0 || isGameOver(board)) {
    return evaluatePosition(board, maximizing);
  }

  const moves = getValidMoves(board, player);
  const next = opponentColor(player);

  if (moves.length === 0) {
    // Pass turn
    return minimax(board, next, maximizing, depth - 1, alpha, beta);
  }

  if (player === maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const result = applyMove(board, move, player);
      const score = minimax(result.board, next, maximizing, depth - 1, alpha, beta);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const result = applyMove(board, move, player);
      const score = minimax(result.board, next, maximizing, depth - 1, alpha, beta);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export const minimaxStrategy: CpuStrategy = {
  rank: "A",
  name: "Expert",
  decideMove(board: Board, color: PlayerColor): Position {
    const moves = getValidMoves(board, color);
    if (moves.length === 0) {
      throw new Error("No valid moves available");
    }

    let bestMove = moves[0];
    let bestScore = -Infinity;
    const depth = 3;

    for (const move of moves) {
      const result = applyMove(board, move, color);
      const score = minimax(
        result.board,
        opponentColor(color),
        color,
        depth - 1,
        -Infinity,
        Infinity,
      );
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  },
};
