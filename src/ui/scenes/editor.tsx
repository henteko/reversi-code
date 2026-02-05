import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { COLORS } from "../theme.js";
import { DEFAULT_PLAYER_CODE } from "../theme.js";
import type { CpuRank } from "../../cpu/types.js";
import { CPU_RANK_INFO } from "../../cpu/types.js";
import { CodeEditor } from "../components/code-editor.js";
import { useEditor } from "../hooks/use-editor.js";
import { transpileTypeScript } from "../../sandbox/transpiler.js";

interface EditorSceneProps {
  rank: CpuRank;
  initialCode?: string;
  onStartBattle: (code: string) => void;
  onBack: () => void;
}

export function EditorScene({ rank, initialCode, onStartBattle, onBack }: EditorSceneProps) {
  const [editorState, editorActions] = useEditor(initialCode || DEFAULT_PLAYER_CODE, 24);
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [buildOk, setBuildOk] = useState(false);

  useInput((input, key) => {
    // Ctrl+R: Build (transpile check)
    if (key.ctrl && input === "r") {
      setBuildStatus("building");
      setErrorMessage(undefined);
      const code = editorActions.getCode();
      transpileTypeScript(code).then((result) => {
        if (result.ok) {
          setBuildStatus("success");
          setErrorMessage(undefined);
          setBuildOk(true);
        } else {
          setBuildStatus("error");
          setErrorMessage(result.error);
          setBuildOk(false);
        }
      });
      return;
    }

    // Ctrl+D: Start battle (only after successful build)
    if (key.ctrl && input === "d") {
      if (buildOk) {
        onStartBattle(editorActions.getCode());
      }
      return;
    }

    // Ctrl+Q: Back to rank-select
    if (key.ctrl && input === "q") {
      onBack();
      return;
    }
  });

  const statusColors: Record<string, string> = {
    idle: COLORS.muted,
    building: COLORS.accent,
    success: COLORS.success,
    error: COLORS.error,
  };

  const statusText: Record<string, string> = {
    idle: "Ready",
    building: "Building...",
    success: "Build OK",
    error: "Build Error",
  };

  const modeLabel = editorState.mode === "normal" ? "NORMAL" : "INSERT";
  const modeColor = editorState.mode === "normal" ? COLORS.info : COLORS.success;

  return (
    <Box flexDirection="column">
      <CodeEditor
        editorState={editorState}
        editorActions={editorActions}
        isActive={true}
        visibleLines={24}
        hint="Ctrl+R: Build  Ctrl+D: Start"
      />

      {/* Status bar */}
      <Text color={COLORS.muted}>{"─".repeat(60)}</Text>
      <Box gap={2}>
        <Text color={modeColor} bold>
          -- {modeLabel} --
        </Text>
        <Text color={COLORS.accent} bold>
          VS {CPU_RANK_INFO[rank].title}
        </Text>
        <Text color={statusColors[buildStatus]}>
          [{statusText[buildStatus]}]
        </Text>
      </Box>
      {errorMessage && (
        <Text color={COLORS.error} wrap="truncate">
          {errorMessage}
        </Text>
      )}
      <Box gap={2}>
        <Text color={COLORS.muted}>Ctrl+R: Build</Text>
        <Text color={buildOk ? COLORS.success : COLORS.muted}>
          Ctrl+D: Start Battle{buildOk ? "" : " (build first)"}
        </Text>
        <Text color={COLORS.muted}>Ctrl+Q: Back</Text>
      </Box>
    </Box>
  );
}
