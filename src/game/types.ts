import type { Board, PlayerColor, Position } from "../types.js";
import type { CpuRank } from "../cpu/types.js";

export type GameEvent =
  | { type: "game-start"; board: Board; cpuRank: CpuRank }
  | { type: "turn-start"; board: Board; player: PlayerColor; turnNumber: number }
  | {
      type: "move-made";
      board: Board;
      player: PlayerColor;
      position: Position;
      flipped: Position[];
      executionTimeMs?: number;
    }
  | { type: "pass"; player: PlayerColor }
  | {
      type: "player-error";
      error: string;
      errorType: "compile" | "runtime" | "timeout" | "invalid-return" | "invalid-move";
    }
  | {
      type: "game-end";
      board: Board;
      result: MatchResult;
    };

export interface MatchResult {
  winner: PlayerColor | "draw";
  blackScore: number;
  whiteScore: number;
  forfeit: boolean;
  totalTurns: number;
}
