export const SYMBOLS = {
  black: "●",
  white: "○",
  empty: "·",
  validMove: "•",
  cursor: "█",
} as const;

export const COLORS = {
  black: "#c0c0c0",
  white: "#ffffff",
  board: "#006400",
  boardBg: "#004d00",
  highlight: "#ffff00",
  error: "#ff4444",
  success: "#44ff44",
  info: "#4488ff",
  muted: "#666666",
  accent: "#ff8800",
  appBg: "#1e1e1e",
  editorBg: "#1e1e1e",
  editorText: "#d4d4d4",
  editorLineNumber: "#858585",
  editorCursor: "#ffffff",
  keyword: "#569cd6",
  string: "#ce9178",
  number: "#b5cea8",
  comment: "#6a9955",
  type: "#4ec9b0",
  function: "#dcdcaa",
} as const;

export const LAYOUT = {
  boardWidth: 34,
  editorMinWidth: 40,
  statusBarHeight: 3,
  logHeight: 8,
} as const;

export const DEFAULT_PLAYER_CODE = `function decideMove(board: number[][], myColor: string): [number, number] {
  // board[row][col]: "black", "white", or null
  // Return [row, col] for your move

  // Collect all valid moves, then pick one at random
  const validMoves: [number, number][] = [];
  const opponent = myColor === "black" ? "white" : "black";
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] !== null) continue;
      for (const [dr, dc] of dirs) {
        let r = row + dr, c = col + dc;
        let found = false;
        while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
          r += dr; c += dc; found = true;
        }
        if (found && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === myColor) {
          validMoves.push([row, col]);
          break;
        }
      }
    }
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}
`;
