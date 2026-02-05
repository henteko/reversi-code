import type { Board, PlayerColor, Position } from "../types.js";

export type CpuRank = "E" | "C" | "A" | "S";

export interface CpuStrategy {
  rank: CpuRank;
  name: string;
  decideMove(board: Board, color: PlayerColor): Position;
}

export const CPU_RANK_ORDER: CpuRank[] = ["E", "C", "A", "S"];

export const CPU_RANK_INFO: Record<CpuRank, { name: string; title: string }> = {
  E: { name: "Novice", title: "Rank E - Novice" },
  C: { name: "Apprentice", title: "Rank C - Apprentice" },
  A: { name: "Expert", title: "Rank A - Expert" },
  S: { name: "Master", title: "Rank S - Master" },
};
