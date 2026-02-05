import type { CpuStrategy, CpuRank } from "./types.js";
import { randomStrategy } from "./random.js";
import { greedyStrategy } from "./greedy.js";
import { minimaxStrategy } from "./minimax.js";
import { masterStrategy } from "./master.js";

export { type CpuStrategy, type CpuRank, CPU_RANK_ORDER, CPU_RANK_INFO } from "./types.js";

const strategies: Record<CpuRank, CpuStrategy> = {
  E: randomStrategy,
  C: greedyStrategy,
  A: minimaxStrategy,
  S: masterStrategy,
};

export function getCpuStrategy(rank: CpuRank): CpuStrategy {
  return strategies[rank];
}
