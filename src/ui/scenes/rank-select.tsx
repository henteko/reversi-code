import React, { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { COLORS } from "../theme.js";
import type { CpuRank } from "../../cpu/types.js";
import { CPU_RANK_ORDER, CPU_RANK_INFO } from "../../cpu/types.js";

interface RankSelectSceneProps {
  unlockedRanks: CpuRank[];
  onSelect: (rank: CpuRank) => void;
  onBack: () => void;
}

export function RankSelectScene({ unlockedRanks, onSelect, onBack }: RankSelectSceneProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useKeyboard((key) => {
    // j / down: move down
    if (key.name === "j" || key.name === "down") {
      setSelectedIdx((prev) => Math.min(prev + 1, CPU_RANK_ORDER.length - 1));
      return;
    }
    // k / up: move up
    if (key.name === "k" || key.name === "up") {
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
      return;
    }
    // l / Enter: select
    if (key.name === "l" || key.name === "return") {
      const rank = CPU_RANK_ORDER[selectedIdx];
      if (unlockedRanks.includes(rank)) {
        onSelect(rank);
      }
      return;
    }
    // h / Escape: back
    if (key.name === "h" || key.name === "escape") {
      onBack();
      return;
    }
  });

  return (
    <box flexDirection="column" paddingTop={Math.max(0, Math.floor((process.stdout.rows - 10) / 2))} paddingLeft={2} paddingRight={2}>
      <text><b fg={COLORS.accent}>Select Opponent Rank</b></text>
      <text fg={COLORS.muted}>
        Defeat each rank to unlock the next one.
      </text>
      <box marginTop={1} flexDirection="column">
        {CPU_RANK_ORDER.map((rank, idx) => {
          const isSelected = idx === selectedIdx;
          const isUnlocked = unlockedRanks.includes(rank);
          const info = CPU_RANK_INFO[rank];
          const indicator = isSelected ? "▸ " : "  ";

          return (
            <box key={rank} flexDirection="row">
              <text fg={isSelected ? COLORS.accent : COLORS.muted}>
                {indicator}
              </text>
              {isSelected && isUnlocked ? (
                <text><b fg={COLORS.accent}>{info.title}</b></text>
              ) : !isUnlocked ? (
                <text fg="#444444">{info.title} [LOCKED]</text>
              ) : (
                <text fg={COLORS.editorText}>{info.title}</text>
              )}
            </box>
          );
        })}
      </box>
      <box flexDirection="row" marginTop={1} gap={2}>
        <text fg={COLORS.muted}>j/k: Move</text>
        <text fg={COLORS.muted}>l/Enter: Select</text>
        <text fg={COLORS.muted}>h/Esc: Back</text>
      </box>
    </box>
  );
}
