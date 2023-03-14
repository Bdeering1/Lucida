/* eslint-disable no-magic-numbers */
import Eval, { MAX_PHASE } from './eval';
import { MAX_DEPTH, MS_PER_SECOND } from '../shared/constants';
import { clamp, PieceVal, SideMultiplier } from '../shared/utils';
import TranspositionTable, { SearchResult } from './transposition-table';
import { getLineString, printMoves } from '../cli/printing';
import { IBoard } from '../board/iboard';
import Move from '../game/move';
import MoveGenerator from '../game/move-generator';
import { Color, Piece, Verbosity } from '../shared/enums';
import PieceSquareTables from './pst';
import { getGameStatus } from '../game/game-state';

const LAST_DEPTH_CUTOFF = 4 * MS_PER_SECOND;
const MIN_MOVE_CUTOFF = 3;

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
     * @description if a capture does not raise the static eval to within this margin of the best line, it is not searched further
     */
    private deltaMargin = 330;
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
    private warmup: boolean;

    private nodes = 0;
    private quiesceNodes = 0;
    private nullMoveCutoffs = 0;
    private deltaPruned = 0;
    private transpositions = 0;
    private scores: number[] = [];

    constructor(board: IBoard, moveGenerator: MoveGenerator, warmup = false, depth = 12, quiesceDepth = 15) {
        this.board = board;
        this.moveManager = moveGenerator;
        this.depthLimit = depth;
        this.effectiveDepth = depth;
        this.quiesceDepth = quiesceDepth;
        this.transpositionTable = moveGenerator.transpositionTable;
        this.warmup = warmup;
        
        PieceSquareTables.init();
    }

    public getBestMove(verbose = Verbosity.normal, lastDepthCutoff = LAST_DEPTH_CUTOFF, depth = this.depthLimit): [Move, number] {
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
        
        this.effectiveDepth = 0;
        let best = 0;
        while ((this.effectiveDepth < depthCutoff && Date.now() - startTime < lastDepthCutoff) || this.effectiveDepth < this.minDepth) {
            this.scores = [];
            this.effectiveDepth++;
            [best,] = this.negaMax(0, -Infinity, Infinity);
            best *= SideMultiplier[this.board.sideToMove];
            
            const moves = this.transpositionTable.getPV(this.board, this.effectiveDepth);
            if (verbose) console.log(`info depth: ${this.effectiveDepth} time ${Date.now() - startTime} score cp ${best} pv ${moves.map(m => m.toString()).join(' ')}`);
        }

        const timeElapsed = Date.now() - startTime;
        const timePerNode = timeElapsed / (this.nodes + this.quiesceNodes);

        if (verbose === Verbosity.debug) {
            console.log(`\ntime: ${(timeElapsed / MS_PER_SECOND).toFixed(2)}s (${timePerNode.toFixed(2)}ms per node)`);
            console.log(`primary: ${this.nodes} quiescence search: ${this.quiesceNodes} delta pruned: ${this.deltaPruned} null move cutoffs: ${this.nullMoveCutoffs}`);
            console.log(`transpositions: ${this.transpositions} table size ${this.transpositionTable.size}`);
            printMoves([...this.moveManager.getCurrentMoves()], this.scores, SideMultiplier[this.board.sideToMove]);

            const moves = this.transpositionTable.getPV(this.board, this.effectiveDepth);
            console.log(`Best line: ${getLineString(this.board, moves)}`);
        }
        
        this.warmup = false;
        const move = this.transpositionTable.getPV(this.board, 1)[0];
        return [move, best];
    }

    private negaMax(depth: number, alpha: number, beta: number): [number, boolean] {
        this.nodes++;
        if (depth >= this.effectiveDepth) return [this.quiesce(0, alpha, beta)[0], false];

        const totalMoves = this.moveManager.generateMoves();
        const status = getGameStatus(this.board, totalMoves);
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
        const cutoff = this.getMoveNumCutoff(totalMoves, depth);
        for (const move of this.moveManager.getCurrentMoves(cutoff)) {
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
            
            if (score >= beta) return [beta, true];
            if (!truncated && depth < (this.transpositionTable.get(this.board.posKey)?.depth || MAX_DEPTH)) {
                if (this.warmup) score -= 10;
                this.transpositionTable.set(this.board.posKey, new SearchResult(score, depth, this.board.ply));
            }

            if (score > alpha) {
                alpha = score;
                pvMove = move;
                this.transpositionTable.get(this.board.posKey)!.candidate = true;
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

    private getMoveNumCutoff(totalMoves: number, depth: number): number {
        if (this.warmup) return clamp(6 - depth, 4, totalMoves);
        if (depth <= 1) return totalMoves;
        return clamp(30 - depth * 6, MIN_MOVE_CUTOFF, totalMoves);
    }
}
