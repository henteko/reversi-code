import React from "react";
import { SYMBOLS, COLORS } from "../theme.js";

interface ScoreBarProps {
  blackScore: number;
  whiteScore: number;
  currentPlayer?: "black" | "white" | null;
}

export function ScoreBar({ blackScore, whiteScore, currentPlayer }: ScoreBarProps) {
  return (
    <box flexDirection="row" gap={2}>
      <text fg={COLORS.black}>
        {currentPlayer === "black" ? (
          <u><b>{SYMBOLS.black} Black: {blackScore}</b></u>
        ) : (
          <>{SYMBOLS.black} Black: {blackScore}</>
        )}
      </text>
      <text fg={COLORS.white}>
        {currentPlayer === "white" ? (
          <u><b>{SYMBOLS.white} White: {whiteScore}</b></u>
        ) : (
          <>{SYMBOLS.white} White: {whiteScore}</>
        )}
      </text>
    </box>
  );
}
