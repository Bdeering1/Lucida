import { Bishops, GetOtherSide, GetRank, IsBishopQueen, IsKing, IsKnight, IsPawn, IsRookQueen, Kings, Knights, NonSlidingPieces, PawnCaptureDir, Pawns, PieceColor, PieceDir, Queens, Rooks, SlidingPieces, StartingRank, sqOffboard } from "../shared/utils";
import { Color, MoveStatus, Piece, Square } from "../shared/enums";
import { MAX_GAME_MOVES, MAX_POSITION_MOVES } from "../shared/constants";
import Eval from "../intelligence/eval";
import { IBoard } from "../board/board-types";
import Move from "./move";
import { getColorString, getSquareString } from "../cli/printing";

export default class MoveManager {
    private board: IBoard;

    /**
     * Lists of possible moves indexed by game ply
     */
    public moveList: Move[][];
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
     * Whether or not moves should be added to the move list for later use
     */
    private addToList = true;

    constructor(board: IBoard) {
        this.board = board;

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_GAME_MOVES);
        this.numMoves = new Array(MAX_GAME_MOVES);
        for (let i = 0; i < MAX_GAME_MOVES; i++) {
            this.moveList[i] = [...emptyMoveArray];
            this.numMoves[i] = 0;
        }
    }

    public * getCurrentMoves(): IterableIterator<Move> {
        for (let i = 0; i < this.numMoves[this.board.ply]; i++) {
            yield this.moveList[this.board.ply][i];
        }
    }

    /**
     * Generate all possible moves for the current position
     */
    public generateMoves(sideToMove = this.board.sideToMove, addToList = true): number | MoveStatus {
        this.moveCount = 0;
        this.addToList = addToList;
        this.sideToMove = sideToMove;
        const ply = this.board.ply;
        const opposingSide = GetOtherSide[sideToMove];

        if (sideToMove === Color.none) return 0;

        // Sliding pieces
        SlidingPieces[sideToMove].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    let totalMove = dir;
                    let sliding = true;
                    while (sliding) {
                        const pieceAtSq = this.board.getPiece(sq + totalMove);
                        const colorAtSq = PieceColor[pieceAtSq];
                        if (sqOffboard(sq + totalMove) || colorAtSq === sideToMove) break;
                        if (colorAtSq === opposingSide) sliding = false;
                        
                        this.addIfLegal(sliding
                            ? new Move(sq, sq + totalMove)
                            : new Move(sq, sq + totalMove, pieceAtSq));
                        totalMove += dir;
                    }
                }
            }
        });

        // Non sliding pieces
        NonSlidingPieces[sideToMove].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    const targetPiece = this.board.getPiece(sq + dir);
                    if (sqOffboard(sq + dir) || PieceColor[targetPiece] === sideToMove) continue;
                    
                    this.addIfLegal(PieceColor[targetPiece] !== opposingSide
                        ? new Move(sq, sq + dir)
                        : new Move(sq, sq + dir, targetPiece));
                }
            }
        });

        // Pawn moves
        const pawnType = Pawns[sideToMove];
        for (const sq of this.board.getSquares(pawnType)) {
            const targetSq = sq + PieceDir[pawnType][sideToMove];
            if (PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                if (GetRank[sq] === StartingRank[opposingSide]) {
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Queens[sideToMove]));
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Rooks[sideToMove]));
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Bishops[sideToMove]));
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Knights[sideToMove]));
                }
                else {
                    const doubleMoveSq = sq + PieceDir[pawnType][sideToMove] * 2;
                    if (GetRank[sq] === StartingRank[sideToMove] && PieceColor[this.board.getPiece(doubleMoveSq)] === Color.none) {
                        this.addIfLegal(new Move(sq, doubleMoveSq));
                    }
                    this.addIfLegal(new Move(sq, targetSq));
                }
            }

            for (const captureDir of PawnCaptureDir[sideToMove]) {
                const captureSq = sq + captureDir;
                if (captureSq === this.board.enPas && sideToMove === this.board.sideToMove) {
                    this.addIfLegal(new Move(sq, captureSq, Pawns[GetOtherSide[this.board.sideToMove]]));
                    continue;
                }
                if (PieceColor[this.board.getPiece(captureSq)] === opposingSide) {
                    if (GetRank[sq] === StartingRank[opposingSide]) {
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Queens[sideToMove]));
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Rooks[sideToMove]));
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Bishops[sideToMove]));
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Knights[sideToMove]));
                    }
                    else this.addIfLegal(new Move(sq, captureSq, this.board.getPiece(captureSq)));
                }
            }
        }

        // Castle moves
        if (this.board.hasCastleMoves()) {
            if (sideToMove === Color.white) {
                if (!this.squareAttacked(Square.e1, Color.black)) {
                    if (this.board.whiteKingCastle
                        && this.board.getPiece(Square.f1) === Piece.none && !this.squareAttacked(Square.f1, Color.black)
                        && this.board.getPiece(Square.g1) === Piece.none && !this.squareAttacked(Square.g1, Color.black)) {
                        this.addMove(new Move(Square.e1, Square.g1));
                    }
                    if (this.board.whiteQueenCastle
                        && this.board.getPiece(Square.b1) === Piece.none && !this.squareAttacked(Square.b1, Color.black)
                        && this.board.getPiece(Square.c1) === Piece.none && !this.squareAttacked(Square.c1, Color.black)
                        && this.board.getPiece(Square.d1) === Piece.none && !this.squareAttacked(Square.d1, Color.black)) {
                        this.addMove(new Move(Square.e1, Square.c1));
                    }
                }
            }
            else if (!this.squareAttacked(Square.e8, Color.white)) {
                if (this.board.blackKingCastle
                    && this.board.getPiece(Square.f8) === Piece.none && !this.squareAttacked(Square.f8, Color.white)
                    && this.board.getPiece(Square.g8) === Piece.none && !this.squareAttacked(Square.g8, Color.white)) {
                    this.addMove(new Move(Square.e8, Square.g8));
                }
                if (this.board.blackQueenCastle
                    && this.board.getPiece(Square.b8) === Piece.none && !this.squareAttacked(Square.b8, Color.white)
                    && this.board.getPiece(Square.c8) === Piece.none && !this.squareAttacked(Square.c8, Color.white)
                    && this.board.getPiece(Square.d8) === Piece.none && !this.squareAttacked(Square.d8, Color.white)) {
                    this.addMove(new Move(Square.e8, Square.c8));
                }
            }
        }

        const kingAttacked = this.squareAttacked(this.board.getSquares(Kings[sideToMove]).next().value, opposingSide);
        if (this.moveCount === 0 && kingAttacked) return MoveStatus.checkmate;
        
        if (addToList) this.numMoves[ply] = this.moveCount;
        return this.moveCount;
    }

    /**
     * Given a square on the inner board and a side, returns whether or not that square is attacked by the given side
     */
    public squareAttacked(sq: Square, atkSide: Color): boolean {
        const defSide = GetOtherSide[atkSide];
        if (atkSide === Color.none) return false;

        //Pawns
        for (const captureDir of PawnCaptureDir[defSide]) {
            const piece = this.board.getPiece(sq + captureDir);
            if (PieceColor[piece] === atkSide && IsPawn[piece]) {
                return true;
            }
        }

        // Kings and Knights
        for (const dir of PieceDir[Piece.whiteKing]) {
            //if (sqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === atkSide && IsKing[piece]) return true;
        }
        for (const dir of PieceDir[Piece.whiteKnight]) {
            //if (sqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === atkSide && IsKnight[piece]) return true;
        }

        // Bishops, Rooks, and Queens
        for (const dir of PieceDir[Piece.whiteBishop]) {
            let totalMove = dir;
            while (true) {
                const piece = this.board.getPiece(sq + totalMove);
                const colorAtSq = PieceColor[piece];
                if (sqOffboard(sq + totalMove) || colorAtSq === defSide) break;
                if (colorAtSq === atkSide && IsBishopQueen[piece]) return true;
                totalMove += dir;
            }
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            let totalMove = dir;
            while (true) {
                const piece = this.board.getPiece(sq + totalMove);
                const colorAtSq = PieceColor[piece];
                if (sqOffboard(sq + totalMove) || colorAtSq === defSide) break;
                if (colorAtSq === atkSide) {
                    if (IsRookQueen[piece]) return true;
                    break;
                }
                totalMove += dir;
            }
        }

        return false;
    }

    /**
     * Adds a move to the move list if a given move does not allow the king to be taken on the next move
     */
    private addIfLegal(move: Move): void {
        if (IsKing[this.board.getPiece(move.to)]) return;
        this.board.makeMove(move);
        const kingSq = this.board.getSquares(Kings[this.sideToMove]).next().value;
        if (kingSq === undefined) throw new Error(`${getColorString(GetOtherSide[this.sideToMove])} king not found`);
        if (!this.squareAttacked(kingSq, GetOtherSide[this.sideToMove])) {
            this.board.undoMove(move);
            this.addMove(move, this.board.ply);
            return;
        }
        this.board.undoMove(move);
    }

    private addMove(move: Move, ply = this.board.ply): void {
        if (this.addToList) this.insertMove(move, ply);
        this.moveCount++;
    }

    private insertMove(move: Move, ply: number): void {
        if (this.moveCount === 0) { this.moveList[ply][0] = move; return; }
        
        let idx = this.moveCount - 1;
        while (idx >= 0 && Eval.getMovePrecedence(this.board, move) > Eval.getMovePrecedence(this.board, this.moveList[ply][idx])) {
            this.moveList[ply][idx + 1] = this.moveList[ply][idx];
            idx--;
        }
        this.moveList[ply][idx + 1] = move;
    }
}