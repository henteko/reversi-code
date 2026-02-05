import { useReducer, useCallback, useRef } from "react";
import type { Board, PlayerColor, Position } from "../../types.js";
import type { CpuRank } from "../../cpu/types.js";
import type { GameEvent, MatchResult } from "../../game/types.js";
import type { LogEntry } from "../components/game-log.js";
import { runGame } from "../../game/controller.js";
import { createBoard } from "../../engine/board.js";
import { getValidMoves } from "../../engine/rules.js";
import { countStones } from "../../engine/score.js";

interface GameState {
  board: Board;
  blackScore: number;
  whiteScore: number;
  currentPlayer: PlayerColor | null;
  turnNumber: number;
  isThinking: boolean;
  isRunning: boolean;
  isFinished: boolean;
  result: MatchResult | null;
  logs: LogEntry[];
  validMoves: Position[];
  lastMove?: Position;
  flippedCells: Position[];
  errorMessage?: string;
}

type GameAction =
  | { type: "reset" }
  | { type: "start" }
  | { type: "event"; event: GameEvent }
  | { type: "clear-highlight" };

const initialState: GameState = {
  board: createBoard(),
  blackScore: 2,
  whiteScore: 2,
  currentPlayer: null,
  turnNumber: 0,
  isThinking: false,
  isRunning: false,
  isFinished: false,
  result: null,
  logs: [],
  validMoves: [],
  flippedCells: [],
};

function posToLabel(pos: Position): string {
  return `${String.fromCharCode(97 + pos[1])}${pos[0] + 1}`;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "reset":
      return { ...initialState, board: createBoard() };

    case "start":
      return { ...state, isRunning: true, isFinished: false, result: null, logs: [] };

    case "clear-highlight":
      return { ...state, flippedCells: [], lastMove: undefined };

    case "event": {
      const { event } = action;
      switch (event.type) {
        case "game-start":
          return {
            ...state,
            board: event.board,
            logs: [...state.logs, { type: "info", message: `Game started vs Rank ${event.cpuRank}` }],
          };

        case "turn-start": {
          const moves = getValidMoves(event.board, event.player);
          return {
            ...state,
            board: event.board,
            currentPlayer: event.player,
            turnNumber: event.turnNumber,
            isThinking: true,
            validMoves: event.player === "black" ? moves : [],
            flippedCells: [],
            lastMove: undefined,
          };
        }

        case "move-made": {
          const stones = countStones(event.board);
          const playerLabel = event.player === "black" ? "You" : "CPU";
          const timeStr = event.executionTimeMs !== undefined ? ` (${event.executionTimeMs}ms)` : "";
          return {
            ...state,
            board: event.board,
            blackScore: stones.black,
            whiteScore: stones.white,
            isThinking: false,
            lastMove: event.position,
            flippedCells: event.flipped,
            validMoves: [],
            logs: [
              ...state.logs,
              {
                type: "move",
                message: `${playerLabel} → ${posToLabel(event.position)} (flipped ${event.flipped.length})${timeStr}`,
              },
            ],
          };
        }

        case "pass":
          return {
            ...state,
            isThinking: false,
            logs: [
              ...state.logs,
              {
                type: "pass",
                message: `${event.player === "black" ? "You" : "CPU"} passed (no valid moves)`,
              },
            ],
          };

        case "player-error":
          return {
            ...state,
            isThinking: false,
            errorMessage: event.error,
            logs: [
              ...state.logs,
              { type: "error", message: `Error: ${event.error}` },
            ],
          };

        case "game-end":
          return {
            ...state,
            board: event.board,
            isRunning: false,
            isFinished: true,
            isThinking: false,
            result: event.result,
            currentPlayer: null,
            validMoves: [],
          };

        default:
          return state;
      }
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const abortRef = useRef(false);

  const deploy = useCallback(async (code: string, rank: CpuRank) => {
    dispatch({ type: "reset" });
    dispatch({ type: "start" });
    abortRef.current = false;

    const game = runGame(code, rank);
    for await (const event of game) {
      if (abortRef.current) break;
      dispatch({ type: "event", event });
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  return { state, deploy, abort, reset };
}
