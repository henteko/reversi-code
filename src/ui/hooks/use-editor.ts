import { useState, useCallback } from "react";

export type VimMode = "normal" | "insert";

export interface EditorState {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  scrollOffset: number;
  mode: VimMode;
  pendingKey: string;
}

export interface KeyInfo {
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export interface EditorActions {
  handleInput: (key: KeyInfo) => void;
  getCode: () => string;
  setCode: (code: string) => void;
}

export function useEditor(
  initialCode: string,
  visibleLines: number = 20,
): [EditorState, EditorActions] {
  const [state, setState] = useState<EditorState>(() => ({
    lines: initialCode.split("\n"),
    cursorRow: 0,
    cursorCol: 0,
    scrollOffset: 0,
    mode: "normal",
    pendingKey: "",
  }));

  const ensureVisible = (row: number, scrollOffset: number): number => {
    if (row < scrollOffset) return row;
    if (row >= scrollOffset + visibleLines) return row - visibleLines + 1;
    return scrollOffset;
  };

  const clampCol = (col: number, line: string, mode: VimMode): number => {
    // In normal mode, cursor can't go past last character
    const max = mode === "normal" ? Math.max(0, line.length - 1) : line.length;
    return Math.min(col, max);
  };

  const handleInput = useCallback(
    (key: KeyInfo) => {
      setState((prev) => {
        const lines = [...prev.lines];
        let { cursorRow, cursorCol, scrollOffset, mode, pendingKey } = prev;

        // --- ESCAPE: always go to normal mode ---
        if (key.name === "escape") {
          if (mode === "insert") {
            mode = "normal";
            cursorCol = Math.max(0, Math.min(cursorCol - 1, lines[cursorRow].length - 1));
          }
          pendingKey = "";
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
        }

        // --- Ctrl combos (both modes) ---
        if (key.ctrl || key.meta) {
          return prev;
        }

        // =====================
        // INSERT MODE
        // =====================
        if (mode === "insert") {
          if (key.name === "up") {
            if (cursorRow > 0) {
              cursorRow--;
              cursorCol = Math.min(cursorCol, lines[cursorRow].length);
              scrollOffset = ensureVisible(cursorRow, scrollOffset);
            }
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }
          if (key.name === "down") {
            if (cursorRow < lines.length - 1) {
              cursorRow++;
              cursorCol = Math.min(cursorCol, lines[cursorRow].length);
              scrollOffset = ensureVisible(cursorRow, scrollOffset);
            }
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }
          if (key.name === "left") {
            if (cursorCol > 0) cursorCol--;
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }
          if (key.name === "right") {
            if (cursorCol < lines[cursorRow].length) cursorCol++;
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }

          if (key.name === "return") {
            const currentLine = lines[cursorRow];
            const before = currentLine.slice(0, cursorCol);
            const after = currentLine.slice(cursorCol);
            const indent = before.match(/^(\s*)/)?.[1] || "";
            const extraIndent = before.trimEnd().endsWith("{") ? "  " : "";
            lines[cursorRow] = before;
            lines.splice(cursorRow + 1, 0, indent + extraIndent + after);
            cursorRow++;
            cursorCol = indent.length + extraIndent.length;
            scrollOffset = ensureVisible(cursorRow, scrollOffset);
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }

          // Backspace and Delete both delete backward in insert mode
          if (key.name === "backspace" || key.name === "delete") {
            if (cursorCol > 0) {
              const line = lines[cursorRow];
              lines[cursorRow] = line.slice(0, cursorCol - 1) + line.slice(cursorCol);
              cursorCol--;
            } else if (cursorRow > 0) {
              const prevLine = lines[cursorRow - 1];
              const currentLine = lines[cursorRow];
              cursorCol = prevLine.length;
              lines[cursorRow - 1] = prevLine + currentLine;
              lines.splice(cursorRow, 1);
              cursorRow--;
              scrollOffset = ensureVisible(cursorRow, scrollOffset);
            }
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }

          if (key.name === "tab") {
            const line = lines[cursorRow];
            lines[cursorRow] = line.slice(0, cursorCol) + "  " + line.slice(cursorCol);
            cursorCol += 2;
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }

          // Regular character
          if (key.name.length === 1 && !key.ctrl && !key.meta) {
            const input = key.name;
            const line = lines[cursorRow];
            lines[cursorRow] = line.slice(0, cursorCol) + input + line.slice(cursorCol);
            cursorCol++;

            // Auto-close brackets
            const closers: Record<string, string> = {
              "(": ")", "[": "]", "{": "}",
              '"': '"', "'": "'", "`": "`",
            };
            if (closers[input]) {
              const updatedLine = lines[cursorRow];
              lines[cursorRow] =
                updatedLine.slice(0, cursorCol) + closers[input] + updatedLine.slice(cursorCol);
            }

            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey };
          }

          return prev;
        }

        // =====================
        // NORMAL MODE
        // =====================
        const input = key.name;

        // Handle pending two-key combos
        if (pendingKey === "d") {
          if (input === "d") {
            // dd: delete line
            if (lines.length > 1) {
              lines.splice(cursorRow, 1);
              if (cursorRow >= lines.length) cursorRow = lines.length - 1;
              cursorCol = clampCol(cursorCol, lines[cursorRow], "normal");
              scrollOffset = ensureVisible(cursorRow, scrollOffset);
            } else {
              lines[0] = "";
              cursorCol = 0;
            }
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
          }
          // d + other: cancel
          pendingKey = "";
          // fall through to handle the current input
        }

        if (pendingKey === "g") {
          if (input === "g") {
            // gg: go to top
            cursorRow = 0;
            cursorCol = clampCol(cursorCol, lines[cursorRow], "normal");
            scrollOffset = ensureVisible(cursorRow, scrollOffset);
            return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
          }
          pendingKey = "";
        }

        // Motion keys
        if (input === "h" || key.name === "left") {
          if (cursorCol > 0) cursorCol--;
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }
        if (input === "l" || key.name === "right") {
          const maxCol = Math.max(0, lines[cursorRow].length - 1);
          if (cursorCol < maxCol) cursorCol++;
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }
        if (input === "j" || key.name === "down") {
          if (cursorRow < lines.length - 1) {
            cursorRow++;
            cursorCol = clampCol(cursorCol, lines[cursorRow], "normal");
            scrollOffset = ensureVisible(cursorRow, scrollOffset);
          }
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }
        if (input === "k" || key.name === "up") {
          if (cursorRow > 0) {
            cursorRow--;
            cursorCol = clampCol(cursorCol, lines[cursorRow], "normal");
            scrollOffset = ensureVisible(cursorRow, scrollOffset);
          }
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // w: forward word
        if (input === "w") {
          const line = lines[cursorRow];
          let c = cursorCol;
          // Skip current word
          while (c < line.length && /\w/.test(line[c])) c++;
          // Skip whitespace
          while (c < line.length && /\s/.test(line[c])) c++;
          if (c >= line.length && cursorRow < lines.length - 1) {
            cursorRow++;
            cursorCol = 0;
            // Skip leading whitespace
            while (cursorCol < lines[cursorRow].length && /\s/.test(lines[cursorRow][cursorCol])) cursorCol++;
          } else {
            cursorCol = clampCol(c, line, "normal");
          }
          scrollOffset = ensureVisible(cursorRow, scrollOffset);
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // b: backward word
        if (input === "b") {
          const line = lines[cursorRow];
          let c = cursorCol;
          if (c > 0) c--;
          while (c > 0 && /\s/.test(line[c])) c--;
          while (c > 0 && /\w/.test(line[c - 1])) c--;
          if (c <= 0 && cursorCol === 0 && cursorRow > 0) {
            cursorRow--;
            cursorCol = Math.max(0, lines[cursorRow].length - 1);
          } else {
            cursorCol = c;
          }
          scrollOffset = ensureVisible(cursorRow, scrollOffset);
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // 0: beginning of line
        if (input === "0") {
          cursorCol = 0;
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // ^: first non-whitespace
        if (input === "^") {
          const match = lines[cursorRow].match(/^\s*/);
          cursorCol = match ? match[0].length : 0;
          cursorCol = clampCol(cursorCol, lines[cursorRow], "normal");
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // $: end of line
        if (input === "$") {
          cursorCol = Math.max(0, lines[cursorRow].length - 1);
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // G: go to bottom
        if (input === "G") {
          cursorRow = lines.length - 1;
          cursorCol = clampCol(cursorCol, lines[cursorRow], "normal");
          scrollOffset = ensureVisible(cursorRow, scrollOffset);
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // g: pending (gg)
        if (input === "g") {
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "g" };
        }

        // d: pending (dd)
        if (input === "d") {
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "d" };
        }

        // x: delete char under cursor
        if (input === "x") {
          const line = lines[cursorRow];
          if (line.length > 0) {
            lines[cursorRow] = line.slice(0, cursorCol) + line.slice(cursorCol + 1);
            if (cursorCol >= lines[cursorRow].length && cursorCol > 0) cursorCol--;
          }
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // X: delete char before cursor
        if (input === "X") {
          if (cursorCol > 0) {
            const line = lines[cursorRow];
            lines[cursorRow] = line.slice(0, cursorCol - 1) + line.slice(cursorCol);
            cursorCol--;
          }
          return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
        }

        // --- Mode switching ---
        // i: insert before cursor
        if (input === "i") {
          return { lines, cursorRow, cursorCol, scrollOffset, mode: "insert", pendingKey: "" };
        }

        // a: insert after cursor
        if (input === "a") {
          cursorCol = Math.min(cursorCol + 1, lines[cursorRow].length);
          return { lines, cursorRow, cursorCol, scrollOffset, mode: "insert", pendingKey: "" };
        }

        // I: insert at beginning of line (first non-whitespace)
        if (input === "I") {
          const match = lines[cursorRow].match(/^\s*/);
          cursorCol = match ? match[0].length : 0;
          return { lines, cursorRow, cursorCol, scrollOffset, mode: "insert", pendingKey: "" };
        }

        // A: insert at end of line
        if (input === "A") {
          cursorCol = lines[cursorRow].length;
          return { lines, cursorRow, cursorCol, scrollOffset, mode: "insert", pendingKey: "" };
        }

        // o: open line below
        if (input === "o") {
          const indent = lines[cursorRow].match(/^(\s*)/)?.[1] || "";
          lines.splice(cursorRow + 1, 0, indent);
          cursorRow++;
          cursorCol = indent.length;
          scrollOffset = ensureVisible(cursorRow, scrollOffset);
          return { lines, cursorRow, cursorCol, scrollOffset, mode: "insert", pendingKey: "" };
        }

        // O: open line above
        if (input === "O") {
          const indent = lines[cursorRow].match(/^(\s*)/)?.[1] || "";
          lines.splice(cursorRow, 0, indent);
          cursorCol = indent.length;
          scrollOffset = ensureVisible(cursorRow, scrollOffset);
          return { lines, cursorRow, cursorCol, scrollOffset, mode: "insert", pendingKey: "" };
        }

        return { lines, cursorRow, cursorCol, scrollOffset, mode, pendingKey: "" };
      });
    },
    [visibleLines],
  );

  const getCode = useCallback(() => {
    return state.lines.join("\n");
  }, [state.lines]);

  const setCode = useCallback((code: string) => {
    setState({
      lines: code.split("\n"),
      cursorRow: 0,
      cursorCol: 0,
      scrollOffset: 0,
      mode: "normal",
      pendingKey: "",
    });
  }, []);

  return [state, { handleInput, getCode, setCode }];
}
