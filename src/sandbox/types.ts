import type { Position } from "../types.js";

export interface SandboxSuccess {
  ok: true;
  move: Position;
  executionTimeMs: number;
}

export interface SandboxError {
  ok: false;
  error: string;
  errorType: "compile" | "runtime" | "timeout" | "invalid-return";
  executionTimeMs: number;
}

export type SandboxResult = SandboxSuccess | SandboxError;
