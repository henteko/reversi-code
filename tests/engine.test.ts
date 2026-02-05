import { describe, it, expect } from "vitest";
import { createBoard, cloneBoard, getCell, setCell, BOARD_SIZE } from "../src/engine/board.js";
import {
  getValidMoves,
  isValidMove,
  applyMove,
  getFlips,
  isGameOver,
} from "../src/engine/rules.js";
import { countStones, getWinner } from "../src/engine/score.js";
import type { Board, Position } from "../src/types.js";

describe("board", () => {
  it("should create initial board with 4 stones", () => {
    const board = createBoard();
    expect(board[3][3]).toBe("white");
    expect(board[3][4]).toBe("black");
    expect(board[4][3]).toBe("black");
    expect(board[4][4]).toBe("white");
  });

  it("should have correct initial stone count", () => {
    const board = createBoard();
    const stones = countStones(board);
    expect(stones.black).toBe(2);
    expect(stones.white).toBe(2);
  });

  it("should clone board independently", () => {
    const board = createBoard();
    const clone = cloneBoard(board);
    setCell(clone, [0, 0], "black");
    expect(getCell(board, [0, 0])).toBeNull();
    expect(getCell(clone, [0, 0])).toBe("black");
  });
});

describe("rules", () => {
  it("should find 4 valid moves for black on initial board", () => {
    const board = createBoard();
    const moves = getValidMoves(board, "black");
    expect(moves.length).toBe(4);
    // Expected valid moves: (2,3), (3,2), (4,5), (5,4)
    const moveSet = new Set(moves.map(([r, c]) => `${r},${c}`));
    expect(moveSet.has("2,3")).toBe(true);
    expect(moveSet.has("3,2")).toBe(true);
    expect(moveSet.has("4,5")).toBe(true);
    expect(moveSet.has("5,4")).toBe(true);
  });

  it("should find 4 valid moves for white on initial board", () => {
    const board = createBoard();
    const moves = getValidMoves(board, "white");
    expect(moves.length).toBe(4);
  });

  it("should correctly apply a move", () => {
    const board = createBoard();
    // Black plays (2, 3) - should flip white at (3, 3)
    const result = applyMove(board, [2, 3], "black");
    expect(result.board[2][3]).toBe("black");
    expect(result.board[3][3]).toBe("black"); // flipped
    expect(result.flipped.length).toBe(1);
    expect(result.flipped[0]).toEqual([3, 3]);
  });

  it("should reject invalid move", () => {
    const board = createBoard();
    expect(isValidMove(board, [0, 0], "black")).toBe(false);
  });

  it("should reject move on occupied cell", () => {
    const board = createBoard();
    expect(isValidMove(board, [3, 3], "black")).toBe(false);
  });

  it("should throw when applying invalid move", () => {
    const board = createBoard();
    expect(() => applyMove(board, [0, 0], "black")).toThrow();
  });

  it("should detect game over when board is full", () => {
    const board: Board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => "black" as const)
    );
    expect(isGameOver(board)).toBe(true);
  });

  it("should not be game over at start", () => {
    const board = createBoard();
    expect(isGameOver(board)).toBe(false);
  });

  it("should correctly handle corner moves", () => {
    // Set up a board where corner move is valid
    const board = createBoard();
    // Fill diagonal to make (0,0) valid for black
    setCell(board, [1, 1], "white");
    setCell(board, [2, 2], "black");
    const flips = getFlips(board, [0, 0], "black");
    expect(flips.length).toBeGreaterThan(0);
  });
});

describe("score", () => {
  it("should count stones correctly", () => {
    const board = createBoard();
    const result = applyMove(board, [2, 3], "black");
    const stones = countStones(result.board);
    expect(stones.black).toBe(4);
    expect(stones.white).toBe(1);
  });

  it("should determine winner correctly", () => {
    const board: Board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );
    setCell(board, [0, 0], "black");
    setCell(board, [0, 1], "black");
    setCell(board, [0, 2], "white");
    expect(getWinner(board)).toBe("black");
  });

  it("should detect draw", () => {
    const board: Board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );
    setCell(board, [0, 0], "black");
    setCell(board, [0, 1], "white");
    expect(getWinner(board)).toBe("draw");
  });
});

describe("pass handling", () => {
  it("should detect when a player must pass", () => {
    // Create a board where one player has no valid moves
    const board: Board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );
    // Only black stones, no white stones adjacent to flip
    setCell(board, [0, 0], "black");
    setCell(board, [0, 1], "black");

    const whiteMoves = getValidMoves(board, "white");
    expect(whiteMoves.length).toBe(0);
  });
});
