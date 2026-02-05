import React from "react";
import { COLORS } from "../theme.js";
import type { CpuRank } from "../../cpu/types.js";
import { CPU_RANK_INFO } from "../../cpu/types.js";
import type { VimMode } from "../hooks/use-editor.js";

interface StatusBarProps {
  rank?: CpuRank;
  compileStatus?: "idle" | "compiling" | "success" | "error";
  errorMessage?: string;
  vimMode?: VimMode;
}

export function StatusBar({ rank, compileStatus = "idle", errorMessage, vimMode = "normal" }: StatusBarProps) {
  const statusColors: Record<string, string> = {
    idle: COLORS.muted,
    compiling: COLORS.accent,
    success: COLORS.success,
    error: COLORS.error,
  };

  const statusText: Record<string, string> = {
    idle: "Ready",
    compiling: "Compiling...",
    success: "Compiled OK",
    error: "Compile Error",
  };

  const modeLabel = vimMode === "normal" ? "NORMAL" : "INSERT";
  const modeColor = vimMode === "normal" ? COLORS.info : COLORS.success;

  return (
    <box flexDirection="column">
      <text fg={COLORS.muted}>{"─".repeat(60)}</text>
      <box flexDirection="row" gap={2}>
        <text><b fg={modeColor}>-- {modeLabel} --</b></text>
        {rank && (
          <text><b fg={COLORS.accent}>VS {CPU_RANK_INFO[rank].title}</b></text>
        )}
        <text fg={statusColors[compileStatus]}>
          [{statusText[compileStatus]}]
        </text>
      </box>
      {errorMessage && (
        <text fg={COLORS.error}>
          {errorMessage.slice(0, 60)}
        </text>
      )}
      <box flexDirection="row" gap={2}>
        <text fg={COLORS.muted}>Ctrl+D: Deploy</text>
        <text fg={COLORS.muted}>Ctrl+R: Reset</text>
        <text fg={COLORS.muted}>Ctrl+Q: Quit</text>
      </box>
    </box>
  );
}
