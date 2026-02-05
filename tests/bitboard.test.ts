import { describe, it, expect } from "bun:test";
import {
  boardToBitBoard,
  bitBoardToBoard,
  bbGetValidMoves,
  bbApplyMove,
  bbGetMoveList,
  bbCountStones,
  bbIsGameOver,
} from "../src/engine/bitboard.js";
import { createBoard } from "../src/engine/board.js";
import { getValidMoves } from "../src/engine/rules.js";

describe("bitboard", () => {
  it("should convert board to bitboard and back", () => {
    const board = createBoard();
    const bb = boardToBitBoard(board);
    const recovered = bitBoardToBoard(bb);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(recovered[r][c]).toBe(board[r][c]);
      }
    }
  });

  it("should find same valid moves as regular engine", () => {
    const board = createBoard();
    const bb = boardToBitBoard(board);

    const regularMoves = getValidMoves(board, "black");
    const bbMoves = bbGetMoveList(bbGetValidMoves(bb, "black"));

    const regularSet = new Set(regularMoves.map(([r, c]) => `${r},${c}`));
    const bbSet = new Set(bbMoves.map(([r, c]) => `${r},${c}`));

    expect(bbSet).toEqual(regularSet);
  });

  it("should count stones correctly", () => {
    const board = createBoard();
    const bb = boardToBitBoard(board);
    const stones = bbCountStones(bb);
    expect(stones.black).toBe(2);
    expect(stones.white).toBe(2);
  });

  it("should apply moves correctly", () => {
    const board = createBoard();
    const bb = boardToBitBoard(board);
    const newBb = bbApplyMove(bb, [2, 3], "black");
    const newBoard = bitBoardToBoard(newBb);

    expect(newBoard[2][3]).toBe("black");
    expect(newBoard[3][3]).toBe("black"); // flipped
    expect(newBoard[3][4]).toBe("black"); // original
  });

  it("should not be game over at start", () => {
    const board = createBoard();
    const bb = boardToBitBoard(board);
    expect(bbIsGameOver(bb)).toBe(false);
  });
});
