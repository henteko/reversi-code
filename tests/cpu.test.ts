import { describe, it, expect } from "bun:test";
import { createBoard } from "../src/engine/board.js";
import { getValidMoves, isValidMove, applyMove, isGameOver } from "../src/engine/rules.js";
import { getCpuStrategy } from "../src/cpu/index.js";
import { opponentColor, type Board, type PlayerColor } from "../src/types.js";

function playCpuVsCpu(rank1: string, rank2: string): { winner: string; turns: number } {
  const cpu1 = getCpuStrategy(rank1 as any);
  const cpu2 = getCpuStrategy(rank2 as any);
  let board = createBoard();
  let currentPlayer: PlayerColor = "black";
  let turns = 0;
  let consecutivePasses = 0;

  while (!isGameOver(board) && turns < 200) {
    const moves = getValidMoves(board, currentPlayer);
    if (moves.length === 0) {
      consecutivePasses++;
      if (consecutivePasses >= 2) break;
      currentPlayer = opponentColor(currentPlayer);
      continue;
    }
    consecutivePasses = 0;

    const cpu = currentPlayer === "black" ? cpu1 : cpu2;
    const move = cpu.decideMove(board, currentPlayer);
    const result = applyMove(board, move, currentPlayer);
    board = result.board;
    currentPlayer = opponentColor(currentPlayer);
    turns++;
  }

  let black = 0, white = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === "black") black++;
      else if (cell === "white") white++;
    }
  }

  return {
    winner: black > white ? "black" : white > black ? "white" : "draw",
    turns,
  };
}

describe("CPU strategies", () => {
  it("Rank E should return valid moves", () => {
    const cpu = getCpuStrategy("E");
    const board = createBoard();
    const move = cpu.decideMove(board, "black");
    expect(isValidMove(board, move, "black")).toBe(true);
  });

  it("Rank C should return valid moves", () => {
    const cpu = getCpuStrategy("C");
    const board = createBoard();
    const move = cpu.decideMove(board, "black");
    expect(isValidMove(board, move, "black")).toBe(true);
  });

  it("Rank A should return valid moves", () => {
    const cpu = getCpuStrategy("A");
    const board = createBoard();
    const move = cpu.decideMove(board, "black");
    expect(isValidMove(board, move, "black")).toBe(true);
  });

  it("Rank S should return valid moves", () => {
    const cpu = getCpuStrategy("S");
    const board = createBoard();
    const move = cpu.decideMove(board, "black");
    expect(isValidMove(board, move, "black")).toBe(true);
  });

  it("Rank S should respond within 1000ms", () => {
    const cpu = getCpuStrategy("S");
    const board = createBoard();
    const start = Date.now();
    cpu.decideMove(board, "black");
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it("CPU vs CPU should complete a full game", () => {
    const result = playCpuVsCpu("E", "E");
    expect(result.turns).toBeGreaterThan(0);
    expect(["black", "white", "draw"]).toContain(result.winner);
  });

  it("Rank C should generally beat Rank E", () => {
    let cWins = 0;
    const games = 5;
    for (let i = 0; i < games; i++) {
      const result = playCpuVsCpu("E", "C");
      // C plays white
      if (result.winner === "white") cWins++;
    }
    // C should win at least 2 out of 5
    expect(cWins).toBeGreaterThanOrEqual(2);
  });
});
