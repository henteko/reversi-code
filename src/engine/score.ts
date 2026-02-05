import type { Board, PlayerColor } from "../types.js";
import { BOARD_SIZE } from "./board.js";

export interface StoneCount {
  black: number;
  white: number;
}

export function countStones(board: Board): StoneCount {
  let black = 0;
  let white = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === "black") black++;
      else if (board[row][col] === "white") white++;
    }
  }
  return { black, white };
}

export function getWinner(board: Board): PlayerColor | "draw" {
  const { black, white } = countStones(board);
  if (black > white) return "black";
  if (white > black) return "white";
  return "draw";
}
