import type { CpuRank } from "../cpu/types.js";

export interface ProgressData {
  unlockedRanks: CpuRank[];
  lastCode?: string;
  wins: Record<string, number>;
}
