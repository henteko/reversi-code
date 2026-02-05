import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { COLORS, SYMBOLS } from "../theme.js";
import type { Board } from "../../types.js";
import type { CpuRank } from "../../cpu/types.js";
import { CPU_RANK_INFO } from "../../cpu/types.js";
import type { MatchResult } from "../../game/types.js";
import { BoardView } from "../components/board-view.js";

interface ResultSceneProps {
  board: Board;
  result: MatchResult;
  rank: CpuRank;
  unlockedRank?: CpuRank | null;
  onContinue: () => void;
  onRematch: () => void;
}

const ACTIONS = ["Continue", "Rematch"] as const;

export function ResultScene({
  board,
  result,
  rank,
  unlockedRank,
  onContinue,
  onRematch,
}: ResultSceneProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useInput((input, key) => {
    // j/l: next option, k/h: prev option
    if (input === "j" || input === "l" || key.downArrow || key.rightArrow) {
      setSelectedIdx((prev) => Math.min(prev + 1, ACTIONS.length - 1));
      return;
    }
    if (input === "k" || input === "h" || key.upArrow || key.leftArrow) {
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
      return;
    }
    // Enter: confirm
    if (key.return) {
      if (selectedIdx === 0) onContinue();
      else onRematch();
      return;
    }
  });

  const playerWon = result.winner === "black";
  const isDraw = result.winner === "draw";

  let title: string;
  let titleColor: string;
  if (playerWon) {
    title = "VICTORY!";
    titleColor = COLORS.success;
  } else if (isDraw) {
    title = "DRAW";
    titleColor = COLORS.accent;
  } else {
    title = result.forfeit ? "FORFEIT" : "DEFEAT";
    titleColor = COLORS.error;
  }

  return (
    <Box flexDirection="column" paddingY={1} paddingX={2}>
      <Box justifyContent="center" marginBottom={1}>
        <Text color={titleColor} bold>
          ══════ {title} ══════
        </Text>
      </Box>

      <Box>
        <Box marginRight={2}>
          <BoardView board={board} />
        </Box>
        <Box flexDirection="column">
          <Text color={COLORS.editorText}>
            vs {CPU_RANK_INFO[rank].title}
          </Text>
          <Box marginTop={1} flexDirection="column">
            <Text color={COLORS.black} bold>
              {SYMBOLS.black} Black (You): {result.blackScore}
            </Text>
            <Text color={COLORS.white} bold>
              {SYMBOLS.white} White (CPU): {result.whiteScore}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text color={COLORS.muted}>
              Total turns: {result.totalTurns}
            </Text>
          </Box>
          {result.forfeit && (
            <Box marginTop={1}>
              <Text color={COLORS.error}>
                Game ended by forfeit (code error)
              </Text>
            </Box>
          )}
          {unlockedRank && (
            <Box marginTop={1}>
              <Text color={COLORS.success} bold>
                {CPU_RANK_INFO[unlockedRank].title} unlocked!
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <Box marginTop={2} gap={2}>
        {ACTIONS.map((action, idx) => (
          <Text
            key={action}
            color={idx === selectedIdx ? COLORS.accent : COLORS.muted}
            bold={idx === selectedIdx}
          >
            {idx === selectedIdx ? "▸ " : "  "}
            {action}
          </Text>
        ))}
      </Box>
      <Box marginTop={1} gap={2}>
        <Text color={COLORS.muted}>j/k: Move</Text>
        <Text color={COLORS.muted}>Enter: Select</Text>
      </Box>
    </Box>
  );
}
