import type { Board, PlayerColor, Position } from "../types.js";
import type { CpuStrategy } from "./types.js";
import { getValidMoves } from "../engine/rules.js";

export const randomStrategy: CpuStrategy = {
  rank: "E",
  name: "Novice",
  decideMove(board: Board, color: PlayerColor): Position {
    const moves = getValidMoves(board, color);
    if (moves.length === 0) {
      throw new Error("No valid moves available");
    }
    return moves[Math.floor(Math.random() * moves.length)];
  },
};
