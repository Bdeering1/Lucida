import { Board, BoardMeta } from "./board";

export function createBoard() {
    return new Board(new BoardMeta());
}

export function resetBoard(): void {
    throw new Error("Method not implemented.");
}

export function parseFen(fen: string): void {
    throw new Error("Method not implemented.");
}