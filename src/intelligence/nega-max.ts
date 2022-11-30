import MoveManager, { Move } from '../game/move-manager';
import { IBoard } from '../board/board-types';

export default class NegaMax {
    private board: IBoard;
    private moveManager: MoveManager;
    private _depth!: number;

    constructor(board: IBoard, moveManager: MoveManager, depth = 3) {
        this.board = board;
        this.moveManager = moveManager;
        this.depth = depth;
    }

    public getBestMove(): Move {
        return this.getBestMoves()[0];
    }

    public getBestMoves(numResults = 1): Move[] {
        return [this.moveManager.currentMoves[0]];
    }

    get depth() {
        return this._depth;
    }
    set depth(depth: number) {
        this._depth = depth;
    }
}