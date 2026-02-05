import type { Board, PlayerColor, Position } from "../types.js";
import type { CpuStrategy } from "./types.js";
import { getValidMoves, applyMove } from "../engine/rules.js";
import { evaluateWithCorners } from "./evaluation.js";

export const greedyStrategy: CpuStrategy = {
  rank: "C",
  name: "Apprentice",
  decideMove(board: Board, color: PlayerColor): Position {
    const moves = getValidMoves(board, color);
    if (moves.length === 0) {
      throw new Error("No valid moves available");
    }

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const result = applyMove(board, move, color);
      const score = evaluateWithCorners(result.board, color);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  },
};
