import ivm from "isolated-vm";
import type { Board, PlayerColor, Position } from "../types.js";
import type { SandboxResult } from "./types.js";
import { transpileTypeScript } from "./transpiler.js";

const MEMORY_LIMIT_MB = 32;
const TIMEOUT_MS = 1000;

export async function executePlayerCode(
  source: string,
  board: Board,
  myColor: PlayerColor,
): Promise<SandboxResult> {
  const start = Date.now();

  // Transpile TS → JS
  const transpiled = await transpileTypeScript(source);
  if (!transpiled.ok) {
    return {
      ok: false,
      error: transpiled.error,
      errorType: "compile",
      executionTimeMs: Date.now() - start,
    };
  }

  let isolate: ivm.Isolate | null = null;

  try {
    isolate = new ivm.Isolate({ memoryLimit: MEMORY_LIMIT_MB });
    const context = await isolate.createContext();
    const jail = context.global;

    // Inject board and myColor
    await jail.set("__board__", JSON.stringify(board));
    await jail.set("__myColor__", myColor);

    // Wrap player code: call decideMove and return result
    const wrappedCode = `
      const board = JSON.parse(__board__);
      const myColor = __myColor__;
      ${transpiled.code}
      const __result__ = decideMove(board, myColor);
      JSON.stringify(__result__);
    `;

    const resultStr = await context.eval(wrappedCode, { timeout: TIMEOUT_MS });
    const elapsed = Date.now() - start;

    // Validate result
    let parsed: unknown;
    try {
      parsed = JSON.parse(resultStr as string);
    } catch {
      return {
        ok: false,
        error: `decideMove() returned invalid value: ${resultStr}`,
        errorType: "invalid-return",
        executionTimeMs: elapsed,
      };
    }

    if (
      !Array.isArray(parsed) ||
      parsed.length !== 2 ||
      typeof parsed[0] !== "number" ||
      typeof parsed[1] !== "number" ||
      !Number.isInteger(parsed[0]) ||
      !Number.isInteger(parsed[1]) ||
      parsed[0] < 0 || parsed[0] > 7 ||
      parsed[1] < 0 || parsed[1] > 7
    ) {
      return {
        ok: false,
        error: `decideMove() must return [row, col] where row and col are integers 0-7, got: ${JSON.stringify(parsed)}`,
        errorType: "invalid-return",
        executionTimeMs: elapsed,
      };
    }

    return {
      ok: true,
      move: parsed as Position,
      executionTimeMs: elapsed,
    };
  } catch (err: unknown) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Script execution timed out")) {
      return {
        ok: false,
        error: `Execution timed out (${TIMEOUT_MS}ms limit)`,
        errorType: "timeout",
        executionTimeMs: elapsed,
      };
    }

    return {
      ok: false,
      error: message,
      errorType: "runtime",
      executionTimeMs: elapsed,
    };
  } finally {
    if (isolate) {
      isolate.dispose();
    }
  }
}
