import React from "react";
import { Box, Text } from "ink";
import type { Board, Position, PlayerColor } from "../../types.js";
import { SYMBOLS, COLORS } from "../theme.js";

interface BoardViewProps {
  board: Board;
  validMoves?: Position[];
  lastMove?: Position;
  flippedCells?: Position[];
  currentPlayer?: PlayerColor;
}

function posInList(pos: Position, list: Position[]): boolean {
  return list.some(([r, c]) => r === pos[0] && c === pos[1]);
}

export function BoardView({
  board,
  validMoves = [],
  lastMove,
  flippedCells = [],
}: BoardViewProps) {
  const colLabels = "  a b c d e f g h";

  return (
    <Box flexDirection="column">
      <Text color={COLORS.muted}>{colLabels}</Text>
      {board.map((row, rowIdx) => (
        <Box key={rowIdx}>
          <Text color={COLORS.muted}>{rowIdx + 1} </Text>
          {row.map((cell, colIdx) => {
            const pos: Position = [rowIdx, colIdx];
            const isLastMove = lastMove && lastMove[0] === rowIdx && lastMove[1] === colIdx;
            const isFlipped = posInList(pos, flippedCells);
            const isValid = posInList(pos, validMoves);

            let symbol: string;
            let color: string;
            let bgColor: string = COLORS.boardBg;

            if (cell === "black") {
              symbol = SYMBOLS.black;
              color = COLORS.black;
            } else if (cell === "white") {
              symbol = SYMBOLS.white;
              color = COLORS.white;
            } else if (isValid) {
              symbol = SYMBOLS.validMove;
              color = COLORS.highlight;
            } else {
              symbol = SYMBOLS.empty;
              color = COLORS.board;
            }

            if (isLastMove) {
              bgColor = "#444400";
            } else if (isFlipped) {
              bgColor = "#333300";
            }

            return (
              <Text key={colIdx} color={color} backgroundColor={bgColor}>
                {symbol}{colIdx < 7 ? " " : ""}
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
