import type { Board, PlayerColor, Position, MoveResult } from "../types.js";
import { opponentColor } from "../types.js";
import { cloneBoard, getCell, setCell, isInBounds, BOARD_SIZE } from "./board.js";

const DIRECTIONS: Position[] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function getFlips(board: Board, pos: Position, player: PlayerColor): Position[] {
  const [row, col] = pos;
  if (!isInBounds(pos) || getCell(board, pos) !== null) {
    return [];
  }

  const opponent = opponentColor(player);
  const allFlips: Position[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const dirFlips: Position[] = [];
    let r = row + dr;
    let c = col + dc;

    while (isInBounds([r, c]) && getCell(board, [r, c]) === opponent) {
      dirFlips.push([r, c]);
      r += dr;
      c += dc;
    }

    if (dirFlips.length > 0 && isInBounds([r, c]) && getCell(board, [r, c]) === player) {
      allFlips.push(...dirFlips);
    }
  }

  return allFlips;
}

export function isValidMove(board: Board, pos: Position, player: PlayerColor): boolean {
  return getFlips(board, pos, player).length > 0;
}

export function getValidMoves(board: Board, player: PlayerColor): Position[] {
  const moves: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isValidMove(board, [row, col], player)) {
        moves.push([row, col]);
      }
    }
  }
  return moves;
}

export function applyMove(board: Board, pos: Position, player: PlayerColor): MoveResult {
  const flips = getFlips(board, pos, player);
  if (flips.length === 0) {
    throw new Error(`Invalid move: [${pos}] for ${player}`);
  }

  const newBoard = cloneBoard(board);
  setCell(newBoard, pos, player);
  for (const flip of flips) {
    setCell(newBoard, flip, player);
  }

  return {
    board: newBoard,
    flipped: flips,
    position: pos,
    player,
  };
}

export function isGameOver(board: Board): boolean {
  return (
    getValidMoves(board, "black").length === 0 &&
    getValidMoves(board, "white").length === 0
  );
}
