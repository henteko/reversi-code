import React from "react";
import { Box, Text } from "ink";
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
    <Box flexDirection="column">
      <Text color={COLORS.muted}>{"─".repeat(60)}</Text>
      <Box gap={2}>
        <Text color={modeColor} bold>
          -- {modeLabel} --
        </Text>
        {rank && (
          <Text color={COLORS.accent} bold>
            VS {CPU_RANK_INFO[rank].title}
          </Text>
        )}
        <Text color={statusColors[compileStatus]}>
          [{statusText[compileStatus]}]
        </Text>
      </Box>
      {errorMessage && (
        <Text color={COLORS.error} wrap="truncate">
          {errorMessage}
        </Text>
      )}
      <Box gap={2}>
        <Text color={COLORS.muted}>Ctrl+D: Deploy</Text>
        <Text color={COLORS.muted}>Ctrl+R: Reset</Text>
        <Text color={COLORS.muted}>Ctrl+Q: Quit</Text>
      </Box>
    </Box>
  );
}
