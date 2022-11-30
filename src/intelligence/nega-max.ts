import MoveManager, { Move } from '../game/move-manager';
import { Color } from '../shared/enums';
import { IBoard } from '../board/board-types';
import { printMoves } from '../cli/printing';

export default class NegaMax {
    private board: IBoard;
    private moveManager: MoveManager;
    private _depth!: number;

    constructor(board: IBoard, moveManager: MoveManager, depth = 1) {
        this.board = board;
        this.moveManager = moveManager;
        this.depth = depth;
    }

    get depth() {
        return this._depth;
    }
    set depth(depth: number) {
        this._depth = depth;
    }

    public getBestMove(): Move {
        return this.getBestMoves()[0];
    }

    public getBestMoves(results = 1): Move[] {
        const numMoves = this.moveManager.generateMoves();
        const moveScores = new Array(numMoves);
        this.moveManager.currentMoves.forEach((move, idx) => {
            this.board.movePiece(move.from, move.to);
            moveScores[idx] = this.negaMax(this.depth - 1);
            this.board.undoMove();
        });

        printMoves(this.board, this.moveManager, moveScores);

        return [this.moveManager.currentMoves[0]];
    }

    private negaMax(currentDepth: number) {
        if (currentDepth === 0) return this.evaluate();

        this.moveManager.generateMoves();
        let bestScore = -Infinity;
        for (const move of this.moveManager.currentMoves) {
            this.board.movePiece(move.from, move.to);
            const score = -this.negaMax(currentDepth - 1);
            this.board.undoMove();

            if (score > bestScore) bestScore = score;
        }

        return bestScore;
    }

    private evaluate() {
        return this.board.material[Color.white] - this.board.material[Color.black];
    }
}