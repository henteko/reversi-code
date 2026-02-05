# Reversi Code

<p align="center">
  <img src="assets/demo.gif" alt="Reversi Code Demo" width="600">
</p>

A terminal-based Reversi (Othello) game where you write your strategy in TypeScript. Code a `decideMove()` function in the built-in editor, and watch it play against CPU opponents of increasing difficulty.

## Features

- **Code your strategy** -- Write a `decideMove(board, myColor)` function in TypeScript using the built-in Vim-style editor
- **Sandboxed execution** -- Your code runs in an [isolated-vm](https://github.com/nicolo-ribaudo/isolated-vm) sandbox (32MB memory, 1s timeout) each turn
- **4 CPU ranks** to beat:
  - **Rank E** -- Random moves
  - **Rank C** -- Greedy (maximizes flips + corner priority)
  - **Rank A** -- Minimax with alpha-beta pruning
  - **Rank S** -- Bitboard-accelerated deep search
- **Progress tracking** -- Wins and rank unlocks are saved between sessions
- **Terminal UI** -- Built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal)

## Requirements

- Node.js >= 18

## Getting Started

```bash
git clone https://github.com/henteko/reversi-code.git
cd reversi-code
npm install
npm run dev
```

## How to Play

1. Select a CPU rank to challenge
2. Write your `decideMove()` function in the editor
3. Your function receives `board` (8x8 number array) and `myColor` (1 for black, -1 for white)
4. Return `[row, col]` (0-indexed) to place your piece
5. Watch the game unfold turn by turn

### Board Representation

```
board[row][col]:
  0  = empty
  1  = black
 -1  = white
```

### Example Strategy

```typescript
function decideMove(board: number[][], myColor: number): [number, number] {
  // Try corners first
  const corners: [number, number][] = [[0,0], [0,7], [7,0], [7,7]];
  for (const [r, c] of corners) {
    if (board[r][c] === 0) return [r, c];
  }
  // Otherwise pick the first empty cell
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return [0, 0];
}
```

> Note: Invalid moves or runtime errors result in an immediate forfeit.

## Development

```bash
npm run dev          # Run the app
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run build        # Compile TypeScript
```

## Tech Stack

- [Ink](https://github.com/vadimdemedes/ink) + [React](https://react.dev/) -- Terminal UI
- [isolated-vm](https://github.com/nicolo-ribaudo/isolated-vm) -- Sandboxed code execution
- [esbuild](https://esbuild.github.io/) -- TypeScript transpilation
- [Vitest](https://vitest.dev/) -- Testing

## License

MIT
