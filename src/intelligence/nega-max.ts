import { IBoard } from '../board/board-types';
import MoveManager from '../game/move-manager';

export default class NegaMax {
    private board: IBoard;
    private _depth!: number;

    constructor(board: IBoard, moveManeger: MoveManager, depth = 3) {
        this.board = board;
        this.depth = depth;
    }

    public getBestMoves(numResults = 1): number[] {
        return [0];
    }

    get depth() {
        return this._depth;
    }
    set depth(depth: number) {
        this._depth = depth;
    }
}