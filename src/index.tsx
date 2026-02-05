import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app.js";

// Set terminal background to #1e1e1e (RGB 30,30,30) and clear screen
process.stdout.write("\x1b[48;2;30;30;30m\x1b[2J\x1b[H");

const renderer = await createCliRenderer({ exitOnCtrlC: true });
createRoot(renderer).render(<App />);
