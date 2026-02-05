import React, { useState } from "react";
import { useKeyboard } from "@opentui/react";
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

  useKeyboard((key) => {
    // j/l: next option, k/h: prev option
    if (key.name === "j" || key.name === "l" || key.name === "down" || key.name === "right") {
      setSelectedIdx((prev) => Math.min(prev + 1, ACTIONS.length - 1));
      return;
    }
    if (key.name === "k" || key.name === "h" || key.name === "up" || key.name === "left") {
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
      return;
    }
    // Enter: confirm
    if (key.name === "return") {
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
    <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center" paddingLeft={2} paddingRight={2}>
      <box flexDirection="column">
        <box flexDirection="row" justifyContent="center" marginBottom={1}>
          <text><b fg={titleColor}>══════ {title} ══════</b></text>
        </box>

        <box flexDirection="row">
          <box flexDirection="column" marginRight={2}>
            <BoardView board={board} />
          </box>
          <box flexDirection="column">
            <text fg={COLORS.editorText}>
              vs {CPU_RANK_INFO[rank].title}
            </text>
            <box marginTop={1} flexDirection="column">
              <text fg={COLORS.black}><b>{SYMBOLS.black} Black (You): {result.blackScore}</b></text>
              <text fg={COLORS.white}><b>{SYMBOLS.white} White (CPU): {result.whiteScore}</b></text>
            </box>
            <box flexDirection="row" marginTop={1}>
              <text fg={COLORS.muted}>
                Total turns: {result.totalTurns}
              </text>
            </box>
            {result.forfeit && (
              <box flexDirection="row" marginTop={1}>
                <text fg={COLORS.error}>
                  Game ended by forfeit (code error)
                </text>
              </box>
            )}
            {unlockedRank && (
              <box flexDirection="row" marginTop={1}>
                <text><b fg={COLORS.success}>{CPU_RANK_INFO[unlockedRank].title} unlocked!</b></text>
              </box>
            )}
          </box>
        </box>

        <box flexDirection="row" marginTop={2} gap={2}>
          {ACTIONS.map((action, idx) => (
            idx === selectedIdx ? (
              <text key={action}><b fg={COLORS.accent}>▸ {action}</b></text>
            ) : (
              <text key={action} fg={COLORS.muted}>  {action}</text>
            )
          ))}
        </box>
        <box flexDirection="row" marginTop={1} gap={2}>
          <text fg={COLORS.muted}>j/k: Move</text>
          <text fg={COLORS.muted}>Enter: Select</text>
        </box>
      </box>
    </box>
  );
}
