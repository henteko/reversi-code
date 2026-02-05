import React from "react";
import { Box, Text, useInput } from "ink";
import { COLORS } from "../theme.js";
import { SyntaxHighlighter } from "./syntax-highlighter.js";
import type { EditorState, EditorActions } from "../hooks/use-editor.js";

interface CodeEditorProps {
  editorState: EditorState;
  editorActions: EditorActions;
  isActive: boolean;
  visibleLines?: number;
  width?: number;
}

export function CodeEditor({
  editorState,
  editorActions,
  isActive,
  visibleLines = 20,
  width,
}: CodeEditorProps) {
  const { lines, cursorRow, cursorCol, scrollOffset, mode } = editorState;

  useInput(
    (input, key) => {
      if (isActive) {
        editorActions.handleInput(input, key);
      }
    },
    { isActive },
  );

  const visibleRange = lines.slice(scrollOffset, scrollOffset + visibleLines);
  const lineNumWidth = String(lines.length).length + 1;

  const modeLabel = mode === "normal" ? "NORMAL" : "INSERT";
  const modeColor = mode === "normal" ? COLORS.info : COLORS.success;

  return (
    <Box flexDirection="column" width={width}>
      <Box>
        <Text color={COLORS.muted} bold>
          ─ Code Editor ─{" "}
        </Text>
        <Text color={modeColor} bold>
          [{modeLabel}]
        </Text>
        <Text color={COLORS.muted} dimColor>
          {" "}Ctrl+D: Deploy
        </Text>
      </Box>
      {visibleRange.map((line, idx) => {
        const lineNum = scrollOffset + idx;
        const isCursorLine = lineNum === cursorRow;
        const numStr = String(lineNum + 1).padStart(lineNumWidth, " ");

        return (
          <Box key={lineNum}>
            <Text color={COLORS.editorLineNumber}>
              {numStr}{" "}
            </Text>
            {isCursorLine && isActive ? (
              <CursorLine line={line} cursorCol={cursorCol} mode={mode} />
            ) : (
              <SyntaxHighlighter line={line} />
            )}
          </Box>
        );
      })}
      {visibleRange.length < visibleLines &&
        Array.from({ length: visibleLines - visibleRange.length }).map((_, i) => (
          <Box key={`empty-${i}`}>
            <Text color={COLORS.editorLineNumber}>
              {"~".padStart(lineNumWidth, " ")}{" "}
            </Text>
          </Box>
        ))}
    </Box>
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
    <Text>
      <Text color={COLORS.editorText}>{before}</Text>
      <Text color={COLORS.editorBg} backgroundColor={cursorBg}>
        {cursorChar}
      </Text>
      <Text color={COLORS.editorText}>{after}</Text>
    </Text>
  );
}
