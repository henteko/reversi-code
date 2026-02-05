export type PlayerColor = "black" | "white";
export type CellValue = PlayerColor | null;
export type Board = CellValue[][];
export type Position = [number, number];

export interface MoveResult {
  board: Board;
  flipped: Position[];
  position: Position;
  player: PlayerColor;
}

export type GamePhase = "title" | "rank-select" | "battle" | "result";

export function opponentColor(color: PlayerColor): PlayerColor {
  return color === "black" ? "white" : "black";
}
