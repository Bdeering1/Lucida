/* eslint-disable no-magic-numbers */
import Eval, { MAX_PHASE } from './eval';
import { MAX_DEPTH, MS_PER_SECOND } from '../shared/constants';
import { PieceVal, SideMultiplier } from '../shared/utils';
import TranspositionTable, { SearchResult } from './transposition-table';
import { getLineString, printMoves } from '../cli/printing';
import { IBoard } from '../board/iboard';
import Move from '../game/move';
import MoveGenerator from '../game/move-generator';
import { Color, Piece } from '../shared/enums';
import PieceSquareTables from './pst';
import { getGameStatus } from '../game/game-state';

const LAST_DEPTH_CUTOFF = 3 * MS_PER_SECOND;

export default class Search {
    private board: IBoard;
    private moveManager: MoveGenerator;
    
    /**
     * Maximum depth of primary search tree
     */
    private depthLimit: number;
    private minDepth = 3;
    /**
     * Actual depth of primary search tree, used during iterative deepening
     */
    private effectiveDepth: number;
    /**
     * Maximum depth of quiescence search
     */
    private quiesceDepth: number;
    /**
     * Whether or not to use delta pruning
     */
    private deltaPruning = true;
    /**
     * Margin used for delta pruning
     * @description if a capture does not raise the static eval to within this margin, it is not searched further
     */
    private deltaMargin = 330;
    /**
     * Additional margin for beta cutoff (in centipawns)
     * @desription higher values lead faster but less accurate search (greatly decreases accuracy)
     */
    private betaMargin = 40;
    private effectiveBetaMargin = 0;
    /**
     * Depth at which effective beta margin must be zero
     */
    private zeroMarginBetaDepth = 5;
    /**
     * Whether or not to use null move pruning
     */
    private nullMovePruning = true;
    /**
     * Margin used to account for the reduced depth of null move search (in centipawns)
     * @description higher values lead to slower but more accurate search
     */
    private nullMoveMargin = 0;
    /**
     * Depth reduction for null move search
     * @description higher values lead to faster but less accurate search
     */
    private nullMoveDepthReduction = 2;
    /**
     * Hash map used to store previously evaluated positions
     */
    private transpositionTable: TranspositionTable;

    private nodes = 0;
    private quiesceNodes = 0;
    private nullMoveCutoffs = 0;
    private deltaPruned = 0;
    private transpositions = 0;
    private scores: number[] = [];

    constructor(board: IBoard, moveGenerator: MoveGenerator, depth = 12, quiesceDepth = 15) {
        this.board = board;
        this.moveManager = moveGenerator;
        this.depthLimit = depth;
        this.effectiveDepth = depth;
        this.quiesceDepth = quiesceDepth;
        this.transpositionTable = moveGenerator.transpositionTable;
        
        PieceSquareTables.init();
    }

    public getBestMove(verbose = false, lastDepthCutoff = LAST_DEPTH_CUTOFF, depth = this.depthLimit): [Move, number] {
        this.transpositionTable.trim(this.board.ply);
        this.depthLimit = depth;
        const depthCutoff = this.getDepthCutoff();
        this.nodes = 0;
        this.quiesceNodes = 0;
        this.nullMoveCutoffs = 0;
        
        if (Eval.getGamePhase(this.board) / MAX_PHASE >= 0.95) {
            this.deltaPruning = false;
            this.nullMovePruning = false;
        }
        
        const startTime = Date.now();
        
        this.effectiveBetaMargin = this.betaMargin;
        this.effectiveDepth = 0;
        let best = 0;
        while ((this.effectiveDepth < depthCutoff && Date.now() - startTime < lastDepthCutoff) || this.effectiveDepth < this.minDepth) {
            this.scores = [];
            this.effectiveDepth++;
            this.effectiveBetaMargin -= 10;
            if (this.effectiveBetaMargin < 0 || this.effectiveDepth < this.zeroMarginBetaDepth) this.effectiveBetaMargin = 0;
            [best,] = this.negaMax(0, -Infinity, Infinity);
            best *= SideMultiplier[this.board.sideToMove];
            
            const moves = this.transpositionTable.getPV(this.board, this.effectiveDepth);
            console.log(`info depth: ${this.effectiveDepth} time ${Date.now() - startTime} score cp ${best} pv ${moves.map(m => m.toString()).join(' ')}`);
        }

        const timeElapsed = Date.now() - startTime;
        const timePerNode = timeElapsed / (this.nodes + this.quiesceNodes);

        if (verbose) {
            console.log(`\ntime: ${(timeElapsed / MS_PER_SECOND).toFixed(2)}s (${timePerNode.toFixed(2)}ms per node)`);
            console.log(`primary: ${this.nodes} quiescence search: ${this.quiesceNodes} delta pruned: ${this.deltaPruned} null move cutoffs: ${this.nullMoveCutoffs}`);
            console.log(`transpositions: ${this.transpositions} table size ${this.transpositionTable.size}`);
            printMoves([...this.moveManager.getCurrentMoves()], this.scores, SideMultiplier[this.board.sideToMove]);

            const moves = this.transpositionTable.getPV(this.board, this.effectiveDepth);
            console.log(`Best line: ${getLineString(this.board, moves)}`);
        }
        
        const move = this.transpositionTable.getPV(this.board, 1)[0];
        return [move, best];
    }

    private negaMax(depth: number, alpha: number, beta: number): [number, boolean] {
        this.nodes++;
        if (depth >= this.effectiveDepth) return [this.quiesce(0, alpha, beta)[0], false];

        const status = getGameStatus(this.board, this.moveManager.generateMoves());
        if (status.complete === true) {
            if (status.winner === Color.none) return [0, false];
            return [-(PieceVal[Piece.whiteKing] - depth), false];
        }
        
        let passScore = -Infinity;
        if (this.nullMovePruning && !this.board.attackTable.inCheck(this.board.sideToMove)) {

            this.board.makeMove(Move.noMove());
            [passScore,] = this.negaMax(depth + 1 + this.nullMoveDepthReduction, -beta, -alpha);
            passScore = -passScore;
            this.board.undoMove(Move.noMove());

            if (passScore >= beta + this.nullMoveMargin) { this.nullMoveCutoffs++; return [beta, true]; }
        }

        let pvMove: Move | undefined;
        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.makeMove(move);
            let truncated = false;
            let score, res;
            if ((res = this.transpositionTable.get(this.board.posKey)) && res.depth <= depth - 1) {
                score = res.score;
                this.transpositions++;
            }
            else {
                [score, truncated] = this.negaMax(depth + 1, -beta, -alpha);
                score = -score;
            }
            this.board.undoMove(move);
            
            if (depth === 0) this.scores.push(score);
            
            if (score >= beta - this.effectiveBetaMargin) return [beta, true];
            if (!truncated && depth < (this.transpositionTable.get(this.board.posKey)?.depth || MAX_DEPTH)) {
                this.transpositionTable.set(this.board.posKey, new SearchResult(score, depth, this.board.ply));
            }

            if (score > alpha) {
                alpha = score;
                pvMove = move;
            }
        }

        if (pvMove) this.transpositionTable.get(this.board.posKey)!.move = pvMove;

        return [alpha, false];
    }

    private quiesce(depth: number, alpha: number, beta: number): [number, boolean] {
        this.quiesceNodes++;
        if (depth === this.quiesceDepth) return [beta, false];

        const standPat = Eval.evaluate(this.board, this.moveManager);
        if (standPat >= beta) return [beta, true];
        if (this.deltaPruning && standPat < alpha - this.deltaMargin) { this.deltaPruned++; return [alpha, false]; }
        if (standPat > alpha) alpha = standPat;

        this.moveManager.generateMoves();
        for (const move of this.moveManager.getCaptureMoves()) {
            this.board.makeMove(move);
            let truncated = false;
            let score, res;
            if ((res = this.transpositionTable.get(this.board.posKey)) && res.depth <= this.effectiveDepth + depth - 1) {
                score = res.score;
                this.transpositions++;
            }
            else {
                [score, truncated] = this.quiesce(depth + 1, -beta, -alpha);
                score = -score;
            }
            this.board.undoMove(move);

            if (score >= beta) return [beta, true];
            if (!truncated && this.effectiveDepth + depth < (this.transpositionTable.get(this.board.posKey)?.depth || MAX_DEPTH)) {
                this.transpositionTable.set(this.board.posKey, new SearchResult(score, this.effectiveDepth + depth, this.board.ply));
            }

            if (score > alpha) {
                alpha = score;
            }
        }

        return [alpha, false];
    }

    private getDepthCutoff(): number {
        let depth = this.depthLimit;
        const phaseRatio = Eval.getGamePhase(this.board) / MAX_PHASE;

        if (phaseRatio > 0.85) depth++;
        if (phaseRatio > 0.95) depth++;

        return depth;
    }
}