import React from "react";
import { useKeyboard } from "@opentui/react";
import { COLORS } from "../theme.js";

const LOGO = `
  ██████╗ ███████╗██╗   ██╗███████╗██████╗ ███████╗██╗
  ██╔══██╗██╔════╝██║   ██║██╔════╝██╔══██╗██╔════╝██║
  ██████╔╝█████╗  ██║   ██║█████╗  ██████╔╝███████╗██║
  ██╔══██╗██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██║
  ██║  ██║███████╗ ╚████╔╝ ███████╗██║  ██║███████║██║
  ╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝
   ██████╗ ██████╗ ██████╗ ███████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝
  ██║     ██║   ██║██║  ██║█████╗
  ██║     ██║   ██║██║  ██║██╔══╝
  ╚██████╗╚██████╔╝██████╔╝███████╗
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
`;

interface TitleSceneProps {
  onStart: () => void;
}

export function TitleScene({ onStart }: TitleSceneProps) {
  useKeyboard((key) => {
    if (key.name === "return" || key.name === "l" || key.name === "space") {
      onStart();
    }
  });

  return (
    <box flexDirection="column" alignItems="center" paddingTop={Math.max(0, Math.floor((process.stdout.rows - 17) / 2))}>
      <text fg={COLORS.accent}>{LOGO}</text>
      <text fg={COLORS.muted}>
        Code your strategy. Defeat the CPU.
      </text>
      <box flexDirection="row" marginTop={1}>
        <text><b fg={COLORS.info}>Press l or ENTER to start</b></text>
      </box>
    </box>
  );
}
