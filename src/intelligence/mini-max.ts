import MoveManager, { Move } from '../game/move-manager';
import { Color } from '../shared/enums';
import { IBoard } from '../board/board-types';
import { printMoves } from '../cli/printing';

export default class NegaMax {
    private board: IBoard;
    private moveManager: MoveManager;
    private _depth!: number;

    private scores: number[] = [];

    constructor(board: IBoard, moveManager: MoveManager, depth = 6) {
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
        this.scores = [];
        this.maxi(this.depth, -Infinity, Infinity);

        console.log(`Depth: ${this.depth}`);
        printMoves(this.board, this.moveManager, this.scores);

        return this.moveManager.currentMoves[0];
    }

    private maxi(depth: number, alpha: number, beta: number): number {
        if (depth === 0) return this.evaluate();

        this.moveManager.generateMoves();
        for (const move of this.moveManager.currentMoves) {
            this.board.movePiece(move.from, move.to);
            const score = this.mini(depth - 1, alpha, beta);
            this.board.undoMove();

            if (depth === this.depth) this.scores.push(score);

            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }

        return alpha;
    }

    private mini(depth: number, alpha: number, beta: number): number {
        if (depth === 0) return this.evaluate();

        this.moveManager.generateMoves();
        for (const move of this.moveManager.currentMoves) {
            this.board.movePiece(move.from, move.to);
            const score = this.maxi(depth - 1, alpha, beta);
            this.board.undoMove();

            if (score <= alpha) return alpha;
            if (score < beta) beta = score;
        }

        return beta;
    }

    private evaluate() {
        return (this.board.material[Color.white] - this.board.material[Color.black]);
    }
}