import type { Board, PlayerColor } from "../types.js";
import { opponentColor } from "../types.js";
import { BOARD_SIZE } from "../engine/board.js";
import { countStones } from "../engine/score.js";
import { getValidMoves } from "../engine/rules.js";

// Position weights for board evaluation
// Corners are highly valuable, edges are good, corner-adjacent cells are bad
const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
];

export function evaluatePosition(board: Board, player: PlayerColor): number {
  const opponent = opponentColor(player);
  let score = 0;

  // Position-based scoring
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (board[row][col] === opponent) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }

  // Mobility bonus
  const myMoves = getValidMoves(board, player).length;
  const oppMoves = getValidMoves(board, opponent).length;
  score += (myMoves - oppMoves) * 5;

  return score;
}

export function evaluateGreedy(board: Board, player: PlayerColor): number {
  const stones = countStones(board);
  const myStones = player === "black" ? stones.black : stones.white;
  const oppStones = player === "black" ? stones.white : stones.black;
  return myStones - oppStones;
}

const CORNER_POSITIONS: [number, number][] = [
  [0, 0], [0, 7], [7, 0], [7, 7],
];

const CORNER_ADJACENT: Map<string, [number, number][]> = new Map([
  ["0,0", [[0, 1], [1, 0], [1, 1]]],
  ["0,7", [[0, 6], [1, 6], [1, 7]]],
  ["7,0", [[6, 0], [6, 1], [7, 1]]],
  ["7,7", [[6, 6], [6, 7], [7, 6]]],
]);

export function evaluateWithCorners(board: Board, player: PlayerColor): number {
  let score = evaluateGreedy(board, player);
  const opponent = opponentColor(player);

  // Corner bonus
  for (const [r, c] of CORNER_POSITIONS) {
    if (board[r][c] === player) score += 100;
    else if (board[r][c] === opponent) score -= 100;
  }

  // Corner-adjacent penalty (only if corner is empty)
  for (const [cornerKey, adjacents] of CORNER_ADJACENT) {
    const [cr, cc] = cornerKey.split(",").map(Number);
    if (board[cr][cc] === null) {
      for (const [ar, ac] of adjacents) {
        if (board[ar][ac] === player) score -= 50;
        else if (board[ar][ac] === opponent) score += 50;
      }
    }
  }

  return score;
}

// Advanced evaluation for Rank S
export function evaluateAdvanced(board: Board, player: PlayerColor): number {
  const opponent = opponentColor(player);
  const stones = countStones(board);
  const totalStones = stones.black + stones.white;
  let score = 0;

  // Position weights
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (board[row][col] === opponent) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }

  // Stable discs (corners and edges connected to corners)
  score += countStableDiscs(board, player) * 15;
  score -= countStableDiscs(board, opponent) * 15;

  // Mobility
  const myMoves = getValidMoves(board, player).length;
  const oppMoves = getValidMoves(board, opponent).length;
  if (totalStones < 50) {
    score += (myMoves - oppMoves) * 8;
  }

  // Endgame: pure stone count
  if (totalStones > 54) {
    const myStones = player === "black" ? stones.black : stones.white;
    const oppStones = player === "black" ? stones.white : stones.black;
    score += (myStones - oppStones) * 20;
  }

  return score;
}

function countStableDiscs(board: Board, player: PlayerColor): number {
  let count = 0;
  // Count only corner-connected stable discs for efficiency
  for (const [cr, cc] of CORNER_POSITIONS) {
    if (board[cr][cc] === player) {
      count++;
      // Check edges extending from this corner
      const dr = cr === 0 ? 1 : -1;
      const dc = cc === 0 ? 1 : -1;
      // Horizontal edge
      for (let c = cc + dc; c >= 0 && c < BOARD_SIZE; c += dc) {
        if (board[cr][c] !== player) break;
        count++;
      }
      // Vertical edge
      for (let r = cr + dr; r >= 0 && r < BOARD_SIZE; r += dr) {
        if (board[r][cc] !== player) break;
        count++;
      }
    }
  }
  return count;
}
