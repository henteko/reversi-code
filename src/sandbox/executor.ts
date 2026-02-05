import variant from "@jitl/quickjs-ng-wasmfile-release-sync";
import { loadQuickJs } from "@sebastianwessel/quickjs";
import type { Board, PlayerColor, Position } from "../types.js";
import type { SandboxResult } from "./types.js";
import { transpileTypeScript } from "./transpiler.js";

const TIMEOUT_MS = 1000;
const MEMORY_LIMIT = 32 * 1024 * 1024; // 32MB
const MAX_STACK_SIZE = 1024 * 1024; // 1MB

let _engine: Awaited<ReturnType<typeof loadQuickJs>> | null = null;

async function getEngine() {
  if (!_engine) {
    _engine = await loadQuickJs(variant);
  }
  return _engine;
}

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

  try {
    const { runSandboxed } = await getEngine();

    const wrappedCode = `
      const board = ${JSON.stringify(board)};
      const myColor = ${JSON.stringify(myColor)};
      ${transpiled.code}
      export default decideMove(board, myColor);
    `;

    const result = await runSandboxed(
      async ({ evalCode }) => evalCode(wrappedCode),
      {
        executionTimeout: TIMEOUT_MS,
        memoryLimit: MEMORY_LIMIT,
        maxStackSize: MAX_STACK_SIZE,
        allowFs: false,
        allowFetch: false,
      },
    );

    const elapsed = Date.now() - start;

    if (!result.ok) {
      const errorName = result.error?.name ?? "";
      const errorMessage = result.error?.message ?? String(result.error);

      if (
        errorName === "ExecutionTimeout" ||
        (errorName === "InternalError" && errorMessage === "interrupted")
      ) {
        return {
          ok: false,
          error: `Execution timed out (${TIMEOUT_MS}ms limit)`,
          errorType: "timeout",
          executionTimeMs: elapsed,
        };
      }

      return {
        ok: false,
        error: errorMessage,
        errorType: "runtime",
        executionTimeMs: elapsed,
      };
    }

    // Validate result
    const parsed: unknown = result.data;

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

    return {
      ok: false,
      error: message,
      errorType: "runtime",
      executionTimeMs: elapsed,
    };
  }
}
