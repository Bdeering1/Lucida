import Eval, { MAX_PHASE } from './eval';
import { PieceVal, SideMultiplier } from '../shared/utils';
import { getMoveNumber, printMoves } from '../cli/printing';
import { IBoard } from '../board/board-types';
import { MS_PER_SECOND } from '../shared/constants';
import Move from '../game/move';
import MoveManager from '../game/move-manager';
import { Piece } from '../shared/enums';
import PieceSquareTables from './pst';
import { getGameStatus } from '../game/game-state';

export default class MiniMax {
    private board: IBoard;
    private moveManager: MoveManager;
    
    /**
     * Maximum depth of primary search tree
     */
    private depth: number;
    /**
     * Maximum depth of primary search tree, adjusted for game phase
     */
    private effectiveDepth: number;
    /**
     * Maximum depth of quiescence search
     */
    private quiesceDepth: number;

    private nodes = 0;
    private quiesceNodes = 0;
    private pruned = 0;
    private quiescePruned = 0;
    private scores: number[] = [];

    constructor(board: IBoard, moveManager: MoveManager, depth = 5, quiesceDepth = 15) {
        this.board = board;
        this.moveManager = moveManager;
        this.depth = depth;
        this.effectiveDepth = depth;
        this.quiesceDepth = quiesceDepth;

        PieceSquareTables.init();
        Eval.init();
    }

    public getBestMove(verbose = false): [Move, number] {
        this.effectiveDepth = this.getEffectiveDepth();
        this.scores = [];
        this.nodes = 0;
        this.quiesceNodes = 0;

        const startTime = Date.now();
        const [best, moves] = this.negamax(this.effectiveDepth, -Infinity, Infinity, new Array<Move>());

        const timeElapsed = Date.now() - startTime;
        const timePerNode = timeElapsed / (this.nodes + this.quiesceNodes);

        if (verbose) {
            console.log(`Depth: ${this.depth} ${this.effectiveDepth > this.depth ? `(+${this.effectiveDepth - this.depth})` : ''}`);
            console.log(`Time: ${(timeElapsed / MS_PER_SECOND).toFixed(2)}s (${timePerNode.toFixed(2)}ms per node)`);
            console.log(`primary: ${this.nodes} (-${this.pruned}) quiescence search: ${this.quiesceNodes} (-${this.quiescePruned})`);
            printMoves([...this.moveManager.getCurrentMoves()], this.scores);
            let line = '\nBest line:';
            moves.forEach((move, idx) => {
                if ((this.board.ply + idx) % 2 === 0) line += ` ${getMoveNumber(this.board.ply + idx)}.`;
                line += ` ${move}`;
            });
            console.log(line);
        }
        
        let idx = 0;
        for (const move of this.moveManager.getCurrentMoves()) {
            if (this.scores[idx++] === best) return [move, best];
        }
        throw new Error(`No move found matching best score of ${best}`);
    }

    private negamax(depthLeft: number, alpha: number, beta: number, moves: Move[]): [number, Move[]] {
        this.nodes++;
        if (depthLeft === 0) return [this.quiesce(this.quiesceDepth, alpha, beta), moves];

        const status = getGameStatus(this.board, this.moveManager.generateMoves());
        if (status.complete === true) return [-(PieceVal[Piece.blackKing] + depthLeft), moves];

        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.makeMove(move);
            let [score, possibleMoves] = this.negamax(depthLeft - 1, -beta, -alpha, moves);
            score = -score;
            this.board.undoMove(move);

            if (depthLeft === this.effectiveDepth) this.scores.push(score);

            if (score >= beta) { this.pruned++; return [beta, moves]; }
            if (score > alpha) {
                alpha = score;
                moves = [...possibleMoves];
                moves[this.effectiveDepth - depthLeft] = move;
            }
        }

        return [alpha, moves];
    }

    private quiesce(depthLeft: number, alpha: number, beta: number) {
        this.quiesceNodes++;
        if (depthLeft === 0) return beta;

        const standPat = Eval.evaluate(this.board, this.moveManager);
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCurrentMoves()) {
            if (move.capture === Piece.none) continue;

            this.board.makeMove(move);
            const score = -this.quiesce(depthLeft - 1, -beta, -alpha);
            this.board.undoMove(move);

            if (score >= beta) { this.quiescePruned++; return beta; }
            if (score > alpha) alpha = score;
        }

        return alpha;
    }

    private getEffectiveDepth(): number {
        let depth = this.depth;
        const phaseRatio = Eval.getGamePhase(this.board) / MAX_PHASE;

        if (phaseRatio > 0.85) depth++;
        if (phaseRatio > 0.95) depth++;

        return depth;
    }
}