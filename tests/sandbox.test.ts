import { describe, it, expect } from "vitest";
import { executePlayerCode } from "../src/sandbox/executor.js";
import { createBoard } from "../src/engine/board.js";

describe("sandbox", () => {
  const board = createBoard();

  it("should execute valid player code", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        return [2, 3];
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.move).toEqual([2, 3]);
    }
  });

  it("should handle compile errors", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        return [2, 3]  // missing semicolons are ok in JS/TS
        const x: = broken syntax here!!!
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("compile");
    }
  });

  it("should handle timeout (infinite loop)", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        while (true) {}
        return [0, 0];
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("timeout");
    }
  }, 10000);

  it("should handle invalid return value (not an array)", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        return "invalid" as any;
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("invalid-return");
    }
  });

  it("should handle out-of-bounds return value", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        return [10, 10];
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("invalid-return");
    }
  });

  it("should handle runtime errors", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        throw new Error("oops");
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("runtime");
    }
  });

  it("should not allow require", async () => {
    const code = `
      function decideMove(board: number[][], myColor: string): [number, number] {
        const fs = require("fs");
        return [0, 0];
      }
    `;
    const result = await executePlayerCode(code, board, "black");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("runtime");
    }
  });
});
