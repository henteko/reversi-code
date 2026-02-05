import React, { useState, useEffect } from "react";
import { COLORS } from "../theme.js";

const DOTS = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];

function Spinner() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % DOTS.length), 80);
    return () => clearInterval(id);
  }, []);
  return <text fg={COLORS.accent}>{DOTS[frame]}</text>;
}

interface TurnIndicatorProps {
  currentPlayer: "black" | "white" | null;
  isThinking: boolean;
  turnNumber: number;
}

export function TurnIndicator({ currentPlayer, isThinking, turnNumber }: TurnIndicatorProps) {
  if (!currentPlayer) {
    return <text fg={COLORS.muted}>Waiting...</text>;
  }

  const label = currentPlayer === "black" ? "Your turn (Black)" : "CPU turn (White)";
  const color = currentPlayer === "black" ? COLORS.info : COLORS.accent;

  return (
    <box flexDirection="row" gap={1}>
      <text fg={COLORS.muted}>Turn {turnNumber + 1}</text>
      <text><b fg={color}>{label}</b></text>
      {isThinking && <Spinner />}
    </box>
  );
}
