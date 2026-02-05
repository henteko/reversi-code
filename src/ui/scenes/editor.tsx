import React, { useState } from "react";
import { useKeyboard } from "@opentui/react";
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

const editorVisibleLines = Math.max(10, process.stdout.rows - 5);

export function EditorScene({ rank, initialCode, onStartBattle, onBack }: EditorSceneProps) {
  const [editorState, editorActions] = useEditor(initialCode || DEFAULT_PLAYER_CODE, editorVisibleLines);
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [buildOk, setBuildOk] = useState(false);

  useKeyboard((key) => {
    // Ctrl+R: Build (transpile check)
    if (key.ctrl && key.name === "r") {
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
    if (key.ctrl && key.name === "d") {
      if (buildOk) {
        onStartBattle(editorActions.getCode());
      }
      return;
    }

    // Ctrl+Q: Back to rank-select
    if (key.ctrl && key.name === "q") {
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
    <box flexDirection="column">
      <CodeEditor
        editorState={editorState}
        editorActions={editorActions}
        isActive={true}
        visibleLines={editorVisibleLines}
        hint="Ctrl+R: Build  Ctrl+D: Start"
      />

      {/* Status bar */}
      <text fg={COLORS.muted}>{"─".repeat(60)}</text>
      <box flexDirection="row" gap={2}>
        <text><b fg={modeColor}>-- {modeLabel} --</b></text>
        <text><b fg={COLORS.accent}>VS {CPU_RANK_INFO[rank].title}</b></text>
        <text fg={statusColors[buildStatus]}>
          [{statusText[buildStatus]}]
        </text>
      </box>
      {errorMessage && (
        <text fg={COLORS.error}>
          {errorMessage.slice(0, 60)}
        </text>
      )}
      <box flexDirection="row" gap={2}>
        <text fg={COLORS.muted}>Ctrl+R: Build</text>
        <text fg={buildOk ? COLORS.success : COLORS.muted}>
          Ctrl+D: Start Battle{buildOk ? "" : " (build first)"}
        </text>
        <text fg={COLORS.muted}>Ctrl+Q: Back</text>
      </box>
    </box>
  );
}
