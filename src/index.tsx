import React from "react";
import { render } from "ink";
import { App } from "./app.js";

// Set terminal background to #1e1e1e (RGB 30,30,30) and clear screen
process.stdout.write("\x1b[48;2;30;30;30m\x1b[2J\x1b[H");

const { waitUntilExit } = render(<App />);

waitUntilExit().then(() => {
  // Reset terminal colors and clear screen
  process.stdout.write("\x1b[0m\x1b[2J\x1b[H");
  process.exit(0);
});
