import React from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { COLORS } from "../theme.js";

interface TurnIndicatorProps {
  currentPlayer: "black" | "white" | null;
  isThinking: boolean;
  turnNumber: number;
}

export function TurnIndicator({ currentPlayer, isThinking, turnNumber }: TurnIndicatorProps) {
  if (!currentPlayer) {
    return <Text color={COLORS.muted}>Waiting...</Text>;
  }

  const label = currentPlayer === "black" ? "Your turn (Black)" : "CPU turn (White)";
  const color = currentPlayer === "black" ? COLORS.info : COLORS.accent;

  return (
    <Box gap={1}>
      <Text color={COLORS.muted}>Turn {turnNumber + 1}</Text>
      <Text color={color} bold>
        {label}
      </Text>
      {isThinking && (
        <Text color={COLORS.accent}>
          <Spinner type="dots" />
        </Text>
      )}
    </Box>
  );
}
