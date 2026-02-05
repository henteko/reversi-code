import React from "react";
import { Box, Text, useInput } from "ink";
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
  useInput((input, key) => {
    if (key.return || input === "l" || input === " ") {
      onStart();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingTop={Math.max(0, Math.floor((process.stdout.rows - 17) / 2))}>
      <Text color={COLORS.accent}>{LOGO}</Text>
      <Text color={COLORS.muted}>
        Code your strategy. Defeat the CPU.
      </Text>
      <Box marginTop={1}>
        <Text color={COLORS.info} bold>
          Press l or ENTER to start
        </Text>
      </Box>
    </Box>
  );
}
