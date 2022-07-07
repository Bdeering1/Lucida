import { Board, BoardMeta } from "./board";
import { IBoard, IBoardSetup } from "./board-types";

export default class BoardSetup implements IBoardSetup {
    private board: IBoard;

    public constructor() {
        this.board = new Board(new BoardMeta());
    }

    public reset(): void {
        throw new Error("Method not implemented.");
    }
    public parseFen(fen: string): void {
        throw new Error("Method not implemented.");
    }
}