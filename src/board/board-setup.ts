import { Board, BoardMeta } from "./board";
import { IBoard, IBoardSetup } from "./board-types";
import BoardUtils from "./board-utils";

export default class BoardSetup implements IBoardSetup {
    private board: IBoard;
    private utils: BoardUtils;

    public constructor() {
        this.utils = new BoardUtils();
        this.board = new Board(new BoardMeta(this.utils), this.utils);
    }

    public reset(): void {
        throw new Error("Method not implemented.");
    }
    public parseFen(fen: string): void {
        throw new Error("Method not implemented.");
    }
}