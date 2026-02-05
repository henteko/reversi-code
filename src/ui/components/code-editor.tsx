import React from "react";
import { useKeyboard } from "@opentui/react";
import { COLORS } from "../theme.js";
import { SyntaxHighlighter } from "./syntax-highlighter.js";
import type { EditorState, EditorActions } from "../hooks/use-editor.js";

interface CodeEditorProps {
  editorState: EditorState;
  editorActions: EditorActions;
  isActive: boolean;
  visibleLines?: number;
  width?: number;
  hint?: string;
}

export function CodeEditor({
  editorState,
  editorActions,
  isActive,
  visibleLines = 20,
  width,
  hint,
}: CodeEditorProps) {
  const { lines, cursorRow, cursorCol, scrollOffset, mode } = editorState;

  useKeyboard((key) => {
    if (!isActive) return;
    editorActions.handleInput(key);
  });

  const visibleRange = lines.slice(scrollOffset, scrollOffset + visibleLines);
  const lineNumWidth = String(lines.length).length + 1;

  const modeLabel = mode === "normal" ? "NORMAL" : "INSERT";
  const modeColor = mode === "normal" ? COLORS.info : COLORS.success;

  return (
    <box flexDirection="column" width={width}>
      <box flexDirection="row">
        <text><b fg={COLORS.muted}>─ Code Editor ─ </b></text>
        <text><b fg={modeColor}>[{modeLabel}]</b></text>
        {hint && (
          <text fg="#444444">
            {" "}{hint}
          </text>
        )}
      </box>
      {visibleRange.map((line, idx) => {
        const lineNum = scrollOffset + idx;
        const isCursorLine = lineNum === cursorRow;
        const numStr = String(lineNum + 1).padStart(lineNumWidth, " ");

        return (
          <box key={lineNum} flexDirection="row">
            <text fg={COLORS.editorLineNumber}>
              {numStr}{" "}
            </text>
            {isCursorLine && isActive ? (
              <CursorLine line={line} cursorCol={cursorCol} mode={mode} />
            ) : (
              <SyntaxHighlighter line={line} />
            )}
          </box>
        );
      })}
      {visibleRange.length < visibleLines &&
        Array.from({ length: visibleLines - visibleRange.length }).map((_, i) => (
          <box key={`empty-${i}`} flexDirection="row">
            <text fg={COLORS.editorLineNumber}>
              {"~".padStart(lineNumWidth, " ")}{" "}
            </text>
          </box>
        ))}
    </box>
  );
}

function CursorLine({
  line,
  cursorCol,
  mode,
}: {
  line: string;
  cursorCol: number;
  mode: string;
}) {
  const before = line.slice(0, cursorCol);
  const cursorChar = cursorCol < line.length ? line[cursorCol] : " ";
  const after = line.slice(cursorCol + 1);

  // In normal mode, block cursor; in insert mode, thin bar (use underline)
  const cursorBg = mode === "normal" ? COLORS.editorCursor : COLORS.accent;

  return (
    <text>
      <span fg={COLORS.editorText}>{before}</span>
      <span fg={COLORS.editorBg} bg={cursorBg}>
        {cursorChar}
      </span>
      <span fg={COLORS.editorText}>{after}</span>
    </text>
  );
}
