/* eslint-disable indent */
import { Bishops, GetOtherSide, GetRank, Kings, Knights, NonSlidingPieces, PawnCaptureDir, Pawns, PieceColor, PieceDir, Queens, Rooks, SlidingPieces, StartingRank, sqOffboard } from "../shared/utils";
import { Color, MoveStatus, Piece, Square } from "../shared/enums";
import { MAX_GAME_MOVES, MAX_POSITION_MOVES } from "../shared/constants";
import Eval from "../intelligence/eval";
import { IBoard } from "../board/iboard";
import Move from "./move";
import TranspositionTable, { SearchResult } from "../intelligence/transposition-table";

export default class MoveGenerator {
    private board: IBoard;

    /**
     * Lists of possible moves indexed by game ply
     */
    public moveList: Move[][];
    /**
     * 
     */
    public movePrecedences: number[];
    /**
     * Number of moves at each given ply
     */
    private numMoves: number[];
    /**
     * Number of moves generated for the current position
     */
    private moveCount = 0;
    /**
     * Current side to move for move generation
     */
    private sideToMove = Color.none;
    /**
     * Whether or not the side to move is in check
     */
    private inCheck = false;
    /**
     * Whether or not moves should be added to the move list for later use (false when evaluating mobility)
     */
    private addToList = true;
    /**
     * Hash map used to store previously evaluated positions
     */
    public transpositionTable: TranspositionTable;
    /**
     * Principal variation move if any
     */
    private pvMove: Move | undefined;

    constructor(board: IBoard) {
        this.board = board;

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_GAME_MOVES);
        this.numMoves = new Array(MAX_GAME_MOVES);
        for (let i = 0; i < MAX_GAME_MOVES; i++) {
            this.moveList[i] = [...emptyMoveArray];
            this.numMoves[i] = 0;
        }
        this.movePrecedences = new Array(MAX_POSITION_MOVES);
        this.transpositionTable = new TranspositionTable();
    }

    public reset(): void {
        this.moveList = new Array(MAX_GAME_MOVES);
        this.numMoves = new Array(MAX_GAME_MOVES);
        this.movePrecedences = new Array(MAX_POSITION_MOVES);
        for (let i = 0; i < MAX_GAME_MOVES; i++) {
            this.moveList[i] = new Array(MAX_POSITION_MOVES);
            this.numMoves[i] = 0;
        }
        this.transpositionTable.clear();
    }

    public * getCurrentMoves(cutoff = this.numMoves[this.board.ply]): IterableIterator<Move> {
        for (let i = 0; i < cutoff; i++) {
            yield this.moveList[this.board.ply][i];
        }
    }

    public * getCaptureMoves(): IterableIterator<Move> {
        for (let i = 0; i < this.numMoves[this.board.ply]; i++) {
            const move = this.moveList[this.board.ply][i];
            if (move.capture === Piece.none) continue;
            if (this.inCheck) yield move;
            if (this.board.attackTable.staticExchangeEval(move.to, this.sideToMove) >= 0) yield move;
        }
    }

    /**
     * Generate all possible moves for the current position
     */
    public generateMoves(sideToMove = this.board.sideToMove, addToList = true): number | MoveStatus {
        if (sideToMove === Color.none) return 0;

        this.pvMove = this.transpositionTable.get(this.board.posKey)?.move;
        this.moveCount = 0;
        this.addToList = addToList;
        this.sideToMove = sideToMove;
        const ply = this.board.ply;
        this.inCheck = this.board.attackTable.inCheck(sideToMove);

        this.generateSlidingMoves();
        this.generateNonSlidingMoves();
        this.generatePawnMoves();
        if (!this.inCheck) this.generateCastleMoves();

        if (addToList) this.numMoves[ply] = this.moveCount;
        if (this.moveCount === 0 && this.inCheck) return MoveStatus.checkmate;
        
        return this.moveCount;
    }

    private generateSlidingMoves() {
        SlidingPieces[this.sideToMove].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    let totalMove = dir;
                    let sliding = true;
                    while (sliding) {
                        const pieceAtSq = this.board.getPiece(sq + totalMove);
                        const colorAtSq = PieceColor[pieceAtSq];
                        if (sqOffboard(sq + totalMove) || colorAtSq === this.sideToMove) break;
                        if (colorAtSq === GetOtherSide[this.sideToMove]) sliding = false;
                        
                        const isLegal = this.addIfLegal(sliding
                                            ? new Move(sq, sq + totalMove)
                                            : new Move(sq, sq + totalMove, pieceAtSq));
                        if (!this.inCheck && !isLegal) break;
                        totalMove += dir;
                    }
                }
            }
        });
    }

    private generateNonSlidingMoves() {
        NonSlidingPieces[this.sideToMove].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    const targetPiece = this.board.getPiece(sq + dir);
                    if (sqOffboard(sq + dir) || PieceColor[targetPiece] === this.sideToMove) continue;
                    
                    this.addIfLegal(PieceColor[targetPiece] !== GetOtherSide[this.sideToMove]
                        ? new Move(sq, sq + dir)
                        : new Move(sq, sq + dir, targetPiece));
                }
            }
        });
    }

    private generatePawnMoves() {
        const pawnType = Pawns[this.sideToMove];
        for (const sq of this.board.getSquares(pawnType)) {
            const targetSq = sq + PieceDir[pawnType][this.sideToMove];
            if (PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                if (GetRank[sq] === StartingRank[GetOtherSide[this.sideToMove]]) {
                    this.addIfLegal(new Move(sq, targetSq, Piece.none, Queens[this.sideToMove]));
                    this.addIfLegal(new Move(sq, targetSq, Piece.none, Rooks[this.sideToMove]));
                    this.addIfLegal(new Move(sq, targetSq, Piece.none, Bishops[this.sideToMove]));
                    this.addIfLegal(new Move(sq, targetSq, Piece.none, Knights[this.sideToMove]));
                }
                else {
                    const doubleMoveSq = sq + PieceDir[pawnType][this.sideToMove] * 2;
                    if (GetRank[sq] === StartingRank[this.sideToMove] && PieceColor[this.board.getPiece(doubleMoveSq)] === Color.none) {
                        this.addIfLegal(new Move(sq, doubleMoveSq));
                    }
                    this.addIfLegal(new Move(sq, targetSq));
                }
            }

            for (const captureDir of PawnCaptureDir[this.sideToMove]) {
                const captureSq = sq + captureDir;
                if (captureSq === this.board.enPas && this.sideToMove === this.board.sideToMove) {
                    this.addIfLegal(new Move(sq, captureSq, Pawns[GetOtherSide[this.board.sideToMove]]));
                    continue;
                }
                if (PieceColor[this.board.getPiece(captureSq)] === GetOtherSide[this.sideToMove]) {
                    if (GetRank[sq] === StartingRank[GetOtherSide[this.sideToMove]]) {
                        this.addIfLegal(new Move(sq, captureSq, this.board.getPiece(captureSq), Queens[this.sideToMove]));
                        this.addIfLegal(new Move(sq, captureSq, this.board.getPiece(captureSq), Rooks[this.sideToMove]));
                        this.addIfLegal(new Move(sq, captureSq, this.board.getPiece(captureSq), Bishops[this.sideToMove]));
                        this.addIfLegal(new Move(sq, captureSq, this.board.getPiece(captureSq), Knights[this.sideToMove]));
                    }
                    else this.addIfLegal(new Move(sq, captureSq, this.board.getPiece(captureSq)));
                }
            }
        }
    }

    private generateCastleMoves() {
        if (this.board.hasCastleMoves) {
            if (this.sideToMove === Color.white) {
                if (this.board.whiteKingCastle
                    && this.board.getPiece(Square.f1) === Piece.none && !this.board.attackTable.isAttacked(Square.f1, Color.black)
                    && this.board.getPiece(Square.g1) === Piece.none && !this.board.attackTable.isAttacked(Square.g1, Color.black)) {
                    this.addMove(new Move(Square.e1, Square.g1));
                }
                if (this.board.whiteQueenCastle
                    && this.board.getPiece(Square.b1) === Piece.none && !this.board.attackTable.isAttacked(Square.b1, Color.black)
                    && this.board.getPiece(Square.c1) === Piece.none && !this.board.attackTable.isAttacked(Square.c1, Color.black)
                    && this.board.getPiece(Square.d1) === Piece.none && !this.board.attackTable.isAttacked(Square.d1, Color.black)) {
                    this.addMove(new Move(Square.e1, Square.c1));
                }
            }
            else {
                if (this.board.blackKingCastle
                    && this.board.getPiece(Square.f8) === Piece.none && !this.board.attackTable.isAttacked(Square.f8, Color.white)
                    && this.board.getPiece(Square.g8) === Piece.none && !this.board.attackTable.isAttacked(Square.g8, Color.white)) {
                    this.addMove(new Move(Square.e8, Square.g8));
                }
                if (this.board.blackQueenCastle
                    && this.board.getPiece(Square.b8) === Piece.none && !this.board.attackTable.isAttacked(Square.b8, Color.white)
                    && this.board.getPiece(Square.c8) === Piece.none && !this.board.attackTable.isAttacked(Square.c8, Color.white)
                    && this.board.getPiece(Square.d8) === Piece.none && !this.board.attackTable.isAttacked(Square.d8, Color.white)) {
                    this.addMove(new Move(Square.e8, Square.c8));
                }
            }
        }
    }

    /**
     * Adds a move to the move list if a given move does not allow the king to be taken on the next move
     */
    private addIfLegal(move: Move): boolean {
        this.board.makeMove(move);
        if (!this.board.attackTable.inCheck(this.sideToMove)) {
            this.board.undoMove(move);
            this.addMove(move, this.board.ply);
            return true;
        }
        this.board.undoMove(move);
        return false;
    }

    private addMove(move: Move, ply = this.board.ply): void {
        if (this.addToList) this.insertMove(move, ply);
        this.moveCount++;
    }

    private insertMove(move: Move, ply: number): void {
        if (this.moveCount === 0) {
            this.moveList[ply][0] = move;
            this.movePrecedences[0] = Eval.getMovePrecedence(this.board, move);
            return;
        }
        
        let precedence;
        if (this.pvMove && move.equals(this.pvMove)) precedence = Infinity;
        else precedence = Eval.getMovePrecedence(this.board, move);
        
        let idx = this.moveCount - 1;
        while (idx >= 0 && precedence > this.movePrecedences[idx]) {
            this.moveList[ply][idx + 1] = this.moveList[ply][idx];
            this.movePrecedences[idx + 1] = this.movePrecedences[idx];
            idx--;
        }
        this.moveList[ply][idx + 1] = move;
        this.movePrecedences[idx + 1] = precedence;
    }
}