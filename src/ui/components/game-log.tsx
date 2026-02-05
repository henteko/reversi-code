import React from "react";
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
    <box flexDirection="column">
      <text><b fg={COLORS.muted}>─ Game Log ─</b></text>
      {visible.length === 0 ? (
        <text fg={COLORS.muted}>No events yet.</text>
      ) : (
        visible.map((entry, i) => (
          <text key={i} fg={LOG_COLORS[entry.type]}>
            {entry.message}
          </text>
        ))
      )}
    </box>
  );
}
