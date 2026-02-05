import React from "react";
import { Box, Text } from "ink";
import { SYMBOLS, COLORS } from "../theme.js";

interface ScoreBarProps {
  blackScore: number;
  whiteScore: number;
  currentPlayer?: "black" | "white" | null;
}

export function ScoreBar({ blackScore, whiteScore, currentPlayer }: ScoreBarProps) {
  return (
    <Box gap={2}>
      <Text
        color={COLORS.black}
        bold={currentPlayer === "black"}
        underline={currentPlayer === "black"}
      >
        {SYMBOLS.black} Black: {blackScore}
      </Text>
      <Text
        color={COLORS.white}
        bold={currentPlayer === "white"}
        underline={currentPlayer === "white"}
      >
        {SYMBOLS.white} White: {whiteScore}
      </Text>
    </Box>
  );
}
