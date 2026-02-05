# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Run app (tsx src/index.tsx)
npm test             # Run all tests (vitest run)
npm run test:watch   # Run tests in watch mode
npm run build        # Compile TypeScript (tsc)
npx tsc --noEmit     # Type check only

# Run a single test file
npm test -- tests/sandbox.test.ts

# Run tests matching a name pattern
npm test -- -t "should execute valid"
```

## Architecture

Terminal-based Reversi game where the player writes a `decideMove()` function in a built-in Vim-style code editor. The player's TypeScript code is transpiled with esbuild and executed in an isolated-vm sandbox each turn.

### Game Loop (AsyncGenerator pattern)

`src/game/controller.ts` exports `runGame()` as an AsyncGenerator that yields typed GameEvents (`game-start`, `turn-start`, `move-made`, `pass`, `player-error`, `game-end`). The `useGame` hook in `src/ui/hooks/use-game.ts` consumes this generator via useReducer to drive React state updates.

### Sandbox Execution (two-phase)

1. **Transpile** (`src/sandbox/transpiler.ts`): esbuild transforms TypeScript to ES2022
2. **Execute** (`src/sandbox/executor.ts`): Creates a new `ivm.Isolate` per turn (32MB memory, 1000ms timeout). Board state and player color are injected as globals. The player's `decideMove(board, myColor)` must return `[row, col]` (0-7 integers). No require/import/network/fs access.

Player errors (compile, runtime, timeout, invalid-return) result in immediate forfeit.

### Scene Navigation

State machine in `src/app.tsx` with `GamePhase = "title" | "rank-select" | "battle" | "result"`. Each phase renders a corresponding scene component from `src/ui/scenes/`.

### Board Representation

- Standard 8x8 array: `number[][]` where 0=empty, 1=black, -1=white
- Bitboard parallel implementation in `src/engine/bitboard.ts` (used by Rank S CPU)
- Player is always black (first move), CPU is always white

### CPU Strategies (`src/cpu/`)

- Rank E: random moves
- Rank C: greedy (maximize flips + corner priority)
- Rank A: minimax with alpha-beta pruning
- Rank S: bitboard-accelerated deep search

### Progress

Wins and rank unlocks persisted at `~/.code-reversi/progress.json` via `src/progress/store.ts`.

## Conventions

- Pure ESM project (`type: "module"` in package.json). Use `.js` extensions in import paths.
- Strict TypeScript with `moduleResolution: "bundler"`, target ES2022, JSX via react-jsx.
- Engine logic in `src/engine/` is pure (no UI/IO dependencies) and must stay that way.
- Vitest with `globals: false` — always import `describe`, `it`, `expect` from `"vitest"`.
- Test timeout is 15000ms (configured in vitest.config.ts).
