import { Colour, Square } from "../shared/enums";
import { IBoardSetup, IBoard } from "./board-types";
import { Board } from "./board-data";

export default class BoardSetup implements IBoardSetup {
    private board: IBoard;

    public constructor() {
        this.board = new Board();
    }

    public reset(): void {
        throw new Error("Method not implemented.");
    }
    public parseFen(fen: string): void {
        throw new Error("Method not implemented.");
    }

    private updateListsMaterial(): void {
        throw new Error("Method not implemented.");
    }
    private generatePositionKey(): void {
        throw new Error("Method not implemented.");
    }
    private initFileRanksBoard(): void {
        throw new Error("Method not implemented.");
    }
    private initHashKeys(): void {
        throw new Error("Method not implemented.");
    }
    private initBoardHistory(): void {
        throw new Error("Method not implemented.");
    }
}