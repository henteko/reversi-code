import React from "react";
import { Box, Text } from "ink";
import { COLORS } from "../theme.js";

export interface LogEntry {
  type: "move" | "pass" | "error" | "info";
  message: string;
}

interface GameLogProps {
  entries: LogEntry[];
  maxLines?: number;
}

const LOG_COLORS: Record<LogEntry["type"], string> = {
  move: COLORS.editorText,
  pass: COLORS.accent,
  error: COLORS.error,
  info: COLORS.info,
};

export function GameLog({ entries, maxLines = 6 }: GameLogProps) {
  const visible = entries.slice(-maxLines);

  return (
    <Box flexDirection="column">
      <Text color={COLORS.muted} bold>
        ─ Game Log ─
      </Text>
      {visible.length === 0 ? (
        <Text color={COLORS.muted}>No events yet.</Text>
      ) : (
        visible.map((entry, i) => (
          <Text key={i} color={LOG_COLORS[entry.type]}>
            {entry.message}
          </Text>
        ))
      )}
    </Box>
  );
}
