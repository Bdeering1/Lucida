import { Color, Piece } from '../shared/enums';
import { PieceVal, SideMultiplier } from '../shared/utils';
import Eval from './eval';
import { IBoard } from '../board/board-types';
import Move from '../game/move';
import MoveManager from '../game/move-manager';
import PieceSquareTables from './pst';
import { getGameStatus } from '../game/game-state';
import { printMoves } from '../cli/printing';

export default class MiniMax {
    private board: IBoard;
    private moveManager: MoveManager;
    
    /**
     * Max of primary search tree
     */
    private depth: number;
    /**
     * Max depth of quiescence search
     */
    private quiesceDepth: number;
    //private delta = 50;

    private nodes = 0;
    private quiesceNodes = 0;
    private scores: number[] = [];

    constructor(board: IBoard, moveManager: MoveManager, depth = 4, quiesceDepth = 10) {
        this.board = board;
        this.moveManager = moveManager;
        this.depth = depth;
        this.quiesceDepth = quiesceDepth;

        PieceSquareTables.init();
        Eval.init();
    }

    public getBestMove(): Move {
        this.scores = [];
        this.nodes = 0;
        this.quiesceNodes = 0;

        let best: number;
        let moves: Move[];
        if (this.board.sideToMove === Color.white)        
            [best, moves] = this.maxi(this.depth, -Infinity, Infinity, new Array<Move>());
        else
            [best, moves] =this.mini(this.depth, -Infinity, Infinity, new Array<Move>());

        console.log(`Depth: ${this.depth}`);
        //console.log(`Total nodes searched: ${this.nodes + this.quiesceNodes}`);
        console.log(`primary: ${this.nodes} quiescent search: ${this.quiesceNodes}`);

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
        this.nodes++;
        if (depthLeft === 0) return [this.quiesceMaxi(this.quiesceDepth, alpha, beta), moves];

        const status = getGameStatus(this.board, this.moveManager.generateMoves());
        if (status.complete === true) return [SideMultiplier[status.winner] * PieceVal[Piece.blackKing] - depthLeft, moves];

        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.movePiece(move.from, move.to, move.promotion);
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
        this.nodes++;
        if (depthLeft === 0) return [this.quiesceMini(this.quiesceDepth, alpha, beta), moves];

        const status = getGameStatus(this.board, this.moveManager.generateMoves());
        if (status.complete === true) return [SideMultiplier[status.winner] * PieceVal[Piece.whiteKing] + depthLeft, moves];

        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.movePiece(move.from, move.to, move.promotion);
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
        this.quiesceNodes++;
        if (depthLeft === 0) return beta;

        const standPat = Eval.evaluate(this.board, this.moveManager);
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            if (!move.capture) continue;

            this.board.movePiece(move.from, move.to, move.promotion);
            const score = this.quiesceMini(depthLeft - 1, alpha, beta);
            this.board.undoMove();

            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }

        return alpha;
    }

    private quiesceMini(depthLeft: number, alpha: number, beta: number) {
        this.quiesceNodes++;
        if (depthLeft === 0) return alpha;

        const standPat = Eval.evaluate(this.board, this.moveManager);
        if (standPat <= alpha) return alpha;
        if (standPat < beta) beta = standPat;

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            if (!move.capture) continue;

            this.board.movePiece(move.from, move.to, move.promotion);
            const score = this.quiesceMaxi(depthLeft - 1, alpha, beta);
            this.board.undoMove();

            if (score <= alpha) return alpha;
            if (score < beta) beta = score;
        }

        return beta;
    }
}