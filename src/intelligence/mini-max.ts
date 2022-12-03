import { Color } from '../shared/enums';
import { IBoard } from '../board/board-types';
import Move from '../game/move';
import MoveManager from '../game/move-manager';
import { printMoves } from '../cli/printing';

export default class MiniMax {
    private board: IBoard;
    private moveManager: MoveManager;
    private depth: number;
    private quiesceDepth = 3;

    private scores: number[] = [];

    constructor(board: IBoard, moveManager: MoveManager, depth = 5) {
        this.board = board;
        this.moveManager = moveManager;
        this.depth = depth;
    }

    public getBestMove(): Move {
        this.scores = [];

        let best: number;
        let moves: Move[];
        if (this.board.sideToMove === Color.white)        
            [best, moves] = this.maxi(this.depth, -Infinity, Infinity, new Array<Move>());
        else
            [best, moves] =this.mini(this.depth, -Infinity, Infinity, new Array<Move>());

        console.log(`Depth: ${this.depth}`);
        printMoves(this.board, this.moveManager, this.scores);

        moves.forEach((move, idx) => {
            console.log(`${idx + 1}: ${move}`);
        });

        let idx = 0;
        for (const move of this.moveManager.getCurrentMoves()) {
            if (this.scores[idx++] === best) return move;
        }
        throw new Error(`No move found matching best score of ${best}`);
    }

    private maxi(depthLeft: number, alpha: number, beta: number, moves: Move[]): [number, Move[]] {
        if (depthLeft === 0) return [this.quiesceMaxi(this.quiesceDepth, alpha, beta), moves];

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.movePiece(move.from, move.to);
            const [score, possibleMoves] = this.mini(depthLeft - 1, alpha, beta, moves);
            this.board.undoMove();

            if (depthLeft === this.depth) this.scores.push(score);

            if (score >= beta) return [beta, moves];
            if (score > alpha) {
                alpha = score;
                moves = [...possibleMoves];
                moves[this.depth - depthLeft] = move;
            }
        }

        return [alpha, moves];
    }

    private mini(depthLeft: number, alpha: number, beta: number, moves: Move[]): [number, Move[]] {
        if (depthLeft === 0) return [this.quiesceMini(this.quiesceDepth, alpha, beta), moves];

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.movePiece(move.from, move.to);
            const [score, possibleMoves] = this.maxi(depthLeft - 1, alpha, beta, moves);
            this.board.undoMove();

            if (depthLeft === this.depth) this.scores.push(score);

            if (score <= alpha) return [alpha, moves];
            if (score < beta) {
                beta = score;
                moves = [...possibleMoves];
                moves[this.depth - depthLeft] = move;
            }
        }

        return [beta, moves];
    }

    private quiesceMaxi(depthLeft: number, alpha: number, beta: number) {
        if (depthLeft === 0) return beta;

        const standPat = this.evaluate();
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            if (!move.capture) continue;

            this.board.movePiece(move.from, move.to);
            const score = this.quiesceMini(depthLeft - 1, alpha, beta);
            this.board.undoMove();

            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }

        return alpha;
    }

    private quiesceMini(depthLeft: number, alpha: number, beta: number) {
        if (depthLeft === 0) return alpha;

        const standPat = this.evaluate();
        if (standPat <= alpha) return alpha;
        if (standPat < beta) beta = standPat;

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            if (!move.capture) continue;

            this.board.movePiece(move.from, move.to);
            const score = this.quiesceMaxi(depthLeft - 1, alpha, beta);
            this.board.undoMove();

            if (score <= alpha) return alpha;
            if (score < beta) beta = score;
        }

        return beta;
    }

    private evaluate(): number {
        return (this.board.material[Color.white] - this.board.material[Color.black]);
    }
}