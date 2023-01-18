import Eval, { MAX_PHASE } from './eval';
import { PieceVal, SideMultiplier } from '../shared/utils';
import { getLineString, printMoves } from '../cli/printing';
import { IBoard } from '../board/iboard';
import { MAX_DEPTH, MS_PER_SECOND } from '../shared/constants';
import Move from '../game/move';
import MoveGenerator from '../game/move-generator';
import { Piece } from '../shared/enums';
import PieceSquareTables from './pst';
import SearchResult, { getPV, trimTranspositions } from './search-result';
import { getGameStatus } from '../game/game-state';

export default class Search {
    private board: IBoard;
    private moveManager: MoveGenerator;
    
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
    /**
     * Whether or not to use delta pruning
     */
    private deltaPruning = true;
    /**
     * Margin used for delta pruning
     * @description if a capture does not raise the static eval to within this margin, it is not searched further
     */
    private deltaMargin = 350;
    /**
     * Additional margin for beta cutoff
     * @desription higher values lead faster but less accurate search
     */
    private betaMargin = 0;
    /**
     * Hash map used to store previously evaluated positions
     */
    private transpositionTable: Map<number, SearchResult> = new Map();

    private nodes = 0;
    private quiesceNodes = 0;
    private deltaPruned = 0;
    private transpositions = 0;
    private scores: number[] = [];

    constructor(board: IBoard, moveGenerator: MoveGenerator, depth = 5, quiesceDepth = 15) {
        this.board = board;
        this.moveManager = moveGenerator;
        this.depth = depth;
        this.effectiveDepth = depth;
        this.quiesceDepth = quiesceDepth;
        this.transpositionTable = moveGenerator.transpositionTable;
        
        PieceSquareTables.init();
    }

    public getBestMove(verbose = false): [Move, number] {
        trimTranspositions(this.transpositionTable, this.board.ply);
        const depthCutoff = this.getDepthCutoff();
        this.scores = [];
        this.nodes = 0;
        this.quiesceNodes = 0;
        
        this.deltaPruning = true;
        if (Eval.getGamePhase(this.board)  / MAX_PHASE >= 0.95) this.deltaPruning = false;
        
        const startTime = Date.now();
        
        this.effectiveDepth = 0;
        let best = 0;
        while (this.effectiveDepth < depthCutoff) {
            this.effectiveDepth++;
            [best,] = this.negaMax(0, -Infinity, Infinity);
            best *= SideMultiplier[this.board.sideToMove];
            
            if (verbose) {
                const moves = getPV(this.transpositionTable, this.board);
                console.log(`Depth ${this.effectiveDepth}: score: ${best} Best line: ${getLineString(this.board, moves, this.effectiveDepth)}`);
            }
        }

        const timeElapsed = Date.now() - startTime;
        const timePerNode = timeElapsed / (this.nodes + this.quiesceNodes);

        if (verbose) {
            console.log(`depth: ${this.depth} ${this.effectiveDepth > this.depth ? `(+${this.effectiveDepth - this.depth})` : ''}`);
            console.log(`time: ${(timeElapsed / MS_PER_SECOND).toFixed(2)}s (${timePerNode.toFixed(2)}ms per node)`);
            console.log(`primary: ${this.nodes} quiescence search: ${this.quiesceNodes} delta pruned: ${this.deltaPruned}`);
            console.log(`transpositions: ${this.transpositions} table size ${this.transpositionTable.size}`);
            printMoves([...this.moveManager.getCurrentMoves()], this.scores, SideMultiplier[this.board.sideToMove]);

            const moves = getPV(this.transpositionTable, this.board);
            console.log(`Best line: ${getLineString(this.board, moves)}`);
        }
        
        let move = getPV(this.transpositionTable, this.board)[0];
        return [move, best];
    }

    private negaMax(depth: number, alpha: number, beta: number): [number, boolean] {
        this.nodes++;
        if (depth === this.effectiveDepth) return [this.quiesce(0, alpha, beta)[0], false];

        const status = getGameStatus(this.board, this.moveManager.generateMoves());
        if (status.complete === true) return [-(PieceVal[Piece.whiteKing] - depth), false];
        
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

            if (score >= beta - this.betaMargin) return [beta, true];
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
        for (const move of this.moveManager.getCurrentMoves()) {
            if (move.capture === Piece.none) continue;
            
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
        let depth = this.depth;
        const phaseRatio = Eval.getGamePhase(this.board) / MAX_PHASE;

        if (phaseRatio > 0.85) depth++;
        if (phaseRatio > 0.95) depth++;

        return depth;
    }
}