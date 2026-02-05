import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
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

  useInput((input, key) => {
    // j / down: move down
    if (input === "j" || key.downArrow) {
      setSelectedIdx((prev) => Math.min(prev + 1, CPU_RANK_ORDER.length - 1));
      return;
    }
    // k / up: move up
    if (input === "k" || key.upArrow) {
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
      return;
    }
    // l / Enter: select
    if (input === "l" || key.return) {
      const rank = CPU_RANK_ORDER[selectedIdx];
      if (unlockedRanks.includes(rank)) {
        onSelect(rank);
      }
      return;
    }
    // h / Escape: back
    if (input === "h" || key.escape) {
      onBack();
      return;
    }
  });

  return (
    <Box flexDirection="column" paddingTop={Math.max(0, Math.floor((process.stdout.rows - 10) / 2))} paddingX={2}>
      <Text color={COLORS.accent} bold>
        Select Opponent Rank
      </Text>
      <Text color={COLORS.muted}>
        Defeat each rank to unlock the next one.
      </Text>
      <Box marginTop={1} flexDirection="column">
        {CPU_RANK_ORDER.map((rank, idx) => {
          const isSelected = idx === selectedIdx;
          const isUnlocked = unlockedRanks.includes(rank);
          const info = CPU_RANK_INFO[rank];
          const indicator = isSelected ? "▸ " : "  ";

          return (
            <Box key={rank}>
              <Text color={isSelected ? COLORS.accent : COLORS.muted}>
                {indicator}
              </Text>
              <Text
                color={!isUnlocked ? COLORS.muted : isSelected ? COLORS.accent : COLORS.editorText}
                bold={isSelected && isUnlocked}
                dimColor={!isUnlocked}
              >
                {info.title}
                {!isUnlocked && " [LOCKED]"}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1} gap={2}>
        <Text color={COLORS.muted}>j/k: Move</Text>
        <Text color={COLORS.muted}>l/Enter: Select</Text>
        <Text color={COLORS.muted}>h/Esc: Back</Text>
      </Box>
    </Box>
  );
}
