import type { Board, CellValue, Position } from "../types.js";

const BOARD_SIZE = 8;

export function createBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from<CellValue>({ length: BOARD_SIZE }).fill(null)
  );
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getCell(board: Board, pos: Position): CellValue {
  const [row, col] = pos;
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return undefined as unknown as CellValue;
  }
  return board[row][col];
}

export function setCell(board: Board, pos: Position, value: CellValue): void {
  const [row, col] = pos;
  board[row][col] = value;
}

export function isInBounds(pos: Position): boolean {
  const [row, col] = pos;
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export { BOARD_SIZE };
