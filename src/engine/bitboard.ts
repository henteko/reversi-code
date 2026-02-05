import type { Board, PlayerColor, Position } from "../types.js";
import { BOARD_SIZE } from "./board.js";

/**
 * Bitboard representation using two bigints (black, white).
 * Bit index = row * 8 + col. Bit 0 = top-left (0,0).
 */
export interface BitBoard {
  black: bigint;
  white: bigint;
}

export function boardToBitBoard(board: Board): BitBoard {
  let black = 0n;
  let white = 0n;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const bit = 1n << BigInt(row * 8 + col);
      if (board[row][col] === "black") black |= bit;
      else if (board[row][col] === "white") white |= bit;
    }
  }
  return { black, white };
}

export function bitBoardToBoard(bb: BitBoard): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const bit = 1n << BigInt(row * 8 + col);
      if (bb.black & bit) board[row][col] = "black";
      else if (bb.white & bit) board[row][col] = "white";
    }
  }
  return board;
}

function getPlayerDiscs(bb: BitBoard, player: PlayerColor): bigint {
  return player === "black" ? bb.black : bb.white;
}

function getOpponentDiscs(bb: BitBoard, player: PlayerColor): bigint {
  return player === "black" ? bb.white : bb.black;
}

const FULL_BOARD = (1n << 64n) - 1n;
const NOT_A_FILE = 0xfefefefefefefefen; // mask out column 0
const NOT_H_FILE = 0x7f7f7f7f7f7f7f7fn; // mask out column 7

type ShiftFn = (b: bigint) => bigint;

const SHIFTS: [ShiftFn, bigint][] = [
  [(b) => b >> 8n, FULL_BOARD],           // N
  [(b) => b << 8n, FULL_BOARD],           // S
  [(b) => (b >> 1n) & NOT_H_FILE, NOT_H_FILE], // W
  [(b) => (b << 1n) & NOT_A_FILE, NOT_A_FILE], // E
  [(b) => (b >> 9n) & NOT_H_FILE, NOT_H_FILE], // NW
  [(b) => (b >> 7n) & NOT_A_FILE, NOT_A_FILE], // NE
  [(b) => (b << 7n) & NOT_H_FILE, NOT_H_FILE], // SW
  [(b) => (b << 9n) & NOT_A_FILE, NOT_A_FILE], // SE
];

export function bbGetValidMoves(bb: BitBoard, player: PlayerColor): bigint {
  const mine = getPlayerDiscs(bb, player);
  const opp = getOpponentDiscs(bb, player);
  const empty = ~(mine | opp) & FULL_BOARD;
  let moves = 0n;

  for (const [shift, mask] of SHIFTS) {
    let candidates = shift(mine) & opp & mask;
    while (candidates) {
      candidates = shift(candidates) & mask;
      moves |= candidates & empty;
      candidates &= opp;
    }
  }
  return moves;
}

export function bbApplyMove(bb: BitBoard, pos: Position, player: PlayerColor): BitBoard {
  const bit = 1n << BigInt(pos[0] * 8 + pos[1]);
  let mine = getPlayerDiscs(bb, player) | bit;
  let opp = getOpponentDiscs(bb, player);
  let flipped = 0n;

  for (const [shift, mask] of SHIFTS) {
    let candidates = shift(bit) & opp & mask;
    let dirFlipped = 0n;
    while (candidates) {
      dirFlipped |= candidates;
      const next = shift(candidates) & mask;
      if (next & mine) {
        flipped |= dirFlipped;
        break;
      }
      candidates = next & opp;
    }
  }

  mine |= flipped;
  opp &= ~flipped;

  return player === "black"
    ? { black: mine, white: opp }
    : { black: opp, white: mine };
}

export function bbCountBits(bits: bigint): number {
  let count = 0;
  let b = bits;
  while (b) {
    b &= b - 1n;
    count++;
  }
  return count;
}

export function bbBitToPosition(bit: bigint): Position {
  let idx = 0;
  let b = bit;
  while (b > 1n) {
    b >>= 1n;
    idx++;
  }
  return [Math.floor(idx / 8), idx % 8];
}

export function bbGetMoveList(moves: bigint): Position[] {
  const result: Position[] = [];
  let remaining = moves;
  while (remaining) {
    const bit = remaining & (-remaining);
    result.push(bbBitToPosition(bit));
    remaining &= remaining - 1n;
  }
  return result;
}

export function bbIsGameOver(bb: BitBoard): boolean {
  return (
    bbGetValidMoves(bb, "black") === 0n &&
    bbGetValidMoves(bb, "white") === 0n
  );
}

export function bbCountStones(bb: BitBoard): { black: number; white: number } {
  return {
    black: bbCountBits(bb.black),
    white: bbCountBits(bb.white),
  };
}
