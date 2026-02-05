import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { CpuRank } from "../cpu/types.js";
import { CPU_RANK_ORDER } from "../cpu/types.js";
import type { ProgressData } from "./types.js";

const PROGRESS_DIR = path.join(os.homedir(), ".code-reversi");
const PROGRESS_FILE = path.join(PROGRESS_DIR, "progress.json");

const DEFAULT_PROGRESS: ProgressData = {
  unlockedRanks: ["E"],
  wins: {},
};

export function loadProgress(): ProgressData {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
      return { ...DEFAULT_PROGRESS, ...data };
    }
  } catch {
    // Ignore errors, return default
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress: ProgressData): void {
  try {
    if (!fs.existsSync(PROGRESS_DIR)) {
      fs.mkdirSync(PROGRESS_DIR, { recursive: true });
    }
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch {
    // Silently fail
  }
}

export function unlockNextRank(progress: ProgressData, currentRank: CpuRank): CpuRank | null {
  const idx = CPU_RANK_ORDER.indexOf(currentRank);
  if (idx < 0 || idx >= CPU_RANK_ORDER.length - 1) return null;
  const nextRank = CPU_RANK_ORDER[idx + 1];
  if (!progress.unlockedRanks.includes(nextRank)) {
    progress.unlockedRanks.push(nextRank);
  }
  return nextRank;
}

export function recordWin(progress: ProgressData, rank: CpuRank): void {
  progress.wins[rank] = (progress.wins[rank] || 0) + 1;
}
