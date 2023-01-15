import Eval, { MAX_PHASE } from './eval';
import { PieceVal, SideMultiplier } from '../shared/utils';
import { getMoveNumber, printMoves } from '../cli/printing';
import { IBoard } from '../board/iboard';
import { MAX_DEPTH, MS_PER_SECOND } from '../shared/constants';
import Move from '../game/move';
import MoveGenerator from '../game/move-generator';
import { Piece } from '../shared/enums';
import PieceSquareTables from './pst';
import SearchResult from './search-result';
import { getGameStatus } from '../game/game-state';

export default class MiniMax {
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
     * Hash map used to store previously evaluated positions
     */
    private transpositionTable: Map<number, SearchResult> = new Map();

    private nodes = 0;
    private quiesceNodes = 0;
    private deltaPruned = 0;
    private transpositions = 0;
    private scores: number[] = [];

    constructor(board: IBoard, moveManager: MoveGenerator, depth = 5, quiesceDepth = 15) {
        this.board = board;
        this.moveManager = moveManager;
        this.depth = depth;
        this.effectiveDepth = depth;
        this.quiesceDepth = quiesceDepth;

        PieceSquareTables.init();
    }

    public getBestMove(verbose = false): [Move, number] {
        this.transpositionTable = new Map<number, SearchResult>();
        this.effectiveDepth = this.getEffectiveDepth();
        this.scores = [];
        this.nodes = 0;
        this.quiesceNodes = 0;

        this.deltaPruning = true;
        if (Eval.getGamePhase(this.board)  / MAX_PHASE >= 0.95) this.deltaPruning = false;

        const startTime = Date.now();
        const [best, _, moves] = this.negaMax(0, -Infinity, Infinity, new Array<Move>());

        const timeElapsed = Date.now() - startTime;
        const timePerNode = timeElapsed / (this.nodes + this.quiesceNodes);

        if (verbose) {
            console.log(`depth: ${this.depth} ${this.effectiveDepth > this.depth ? `(+${this.effectiveDepth - this.depth})` : ''}`);
            console.log(`time: ${(timeElapsed / MS_PER_SECOND).toFixed(2)}s (${timePerNode.toFixed(2)}ms per node)`);
            console.log(`primary: ${this.nodes} quiescence search: ${this.quiesceNodes} delta pruned: ${this.deltaPruned}`);
            console.log(`transpositions: ${this.transpositions} table size ${this.transpositionTable.size}`);
            printMoves([...this.moveManager.getCurrentMoves()], this.scores, SideMultiplier[this.board.sideToMove]);
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

    private negaMax(depth: number, alpha: number, beta: number, moves: Move[]): [number, boolean, Move[]] {
        this.nodes++;
        if (depth === this.effectiveDepth) {
            return [this.quiesce(0, alpha, beta)[0], false, moves];
        }

        const status = getGameStatus(this.board, this.moveManager.generateMoves());
        if (status.complete === true) return [-(PieceVal[Piece.blackKing] - depth), false, moves];

        if (depth >= 2) {
            for (const move of this.moveManager.getCurrentMoves()) {
                let score = -Infinity;
                this.board.makeMove(move);
                let res;
                if ((res = this.transpositionTable.get(this.board.posKey)) && res.depth <= depth - 1) {
                    score = res.score;
                    this.transpositions++;
                }
                this.board.undoMove(move);
    
                if (score >= beta) return [beta, true, moves];
                if (score > alpha) {
                    alpha = score;
                    moves = [...moves];
                    moves[depth] = move;
                }
            } 
        }
        
        let truncated = false;
        for (const move of this.moveManager.getCurrentMoves()) {
            this.board.makeMove(move);
            let score, possibleMoves, res;
            if ((res = this.transpositionTable.get(this.board.posKey)) && res.depth <= depth - 1) {
                score = res.score;
                possibleMoves = moves;
                this.transpositions++;
            }
            else {
                [score, truncated, possibleMoves] = this.negaMax(depth + 1, -beta, -alpha, moves);
                score = -score;
            }
            this.board.undoMove(move);
            
            if (depth === 0) this.scores.push(score);

            if (score >= beta) return [beta, true, moves];
            if (!truncated/* && depth < (this.transpositionTable.get(this.board.posKey)?.depth || MAX_DEPTH)*/) {
                this.transpositionTable.set(this.board.posKey, new SearchResult(score, depth));
            }

            if (score > alpha) {
                alpha = score;
                moves = [...possibleMoves];
                moves[depth] = move;
            }
        }

        return [alpha, truncated, moves];
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

            let score = -Infinity;
            this.board.makeMove(move);
            let res;
            if ((res = this.transpositionTable.get(this.board.posKey)) && res.depth <= this.effectiveDepth + depth - 1) {
                score = res.score;
                this.transpositions++;
            }
            this.board.undoMove(move);

            if (score >= beta) return [beta, true];
            if (score > alpha) alpha = score;
        }

        let truncated = false;
        for (const move of this.moveManager.getCurrentMoves()) {
            if (move.capture === Piece.none) continue;

            this.board.makeMove(move);
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
            if (!truncated/* && this.effectiveDepth + depth < (this.transpositionTable.get(this.board.posKey)?.depth || MAX_DEPTH)*/) {
                this.transpositionTable.set(this.board.posKey, new SearchResult(score, this.effectiveDepth + depth));
            }

            if (score > alpha) {
                alpha = score;
            }
        }

        return [alpha, truncated];
    }

    private getEffectiveDepth(): number {
        let depth = this.depth;
        const phaseRatio = Eval.getGamePhase(this.board) / MAX_PHASE;

        if (phaseRatio > 0.85) depth++;
        if (phaseRatio > 0.95) depth++;

        return depth;
    }
}