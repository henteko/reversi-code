import { transform } from "esbuild";

export interface TranspileResult {
  ok: true;
  code: string;
}

export interface TranspileError {
  ok: false;
  error: string;
  line?: number;
  column?: number;
}

export async function transpileTypeScript(
  source: string,
): Promise<TranspileResult | TranspileError> {
  try {
    const result = await transform(source, {
      loader: "ts",
      target: "es2022",
      format: "esm",
    });
    return { ok: true, code: result.code };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Try to extract line/column from esbuild error
    const match = message.match(/:(\d+):(\d+):/);
    return {
      ok: false,
      error: message,
      line: match ? parseInt(match[1]) : undefined,
      column: match ? parseInt(match[2]) : undefined,
    };
  }
}
