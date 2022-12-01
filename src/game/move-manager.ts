import { Bishops, CastleLeftRook, CastleRightRook, GetOtherSide, GetRank, IsBishopQueen, IsKing, IsKnight, IsQueen, IsRookQueen, Kings, Knights, NonSlidingPieces, PawnCaptureDir, Pawns, PieceColor, PieceDir, Queens, Rooks, SlidingPieces, StartingRank, sqOffboard } from "../shared/utils";
import { Color, MoveStatus, Piece, Square } from "../shared/enums";
import { MAX_GAME_MOVES, MAX_POSITION_MOVES } from "../shared/constants";
import { IBoard } from "../board/board-types";
import Move from "./move";

export default class MoveManager {
    private board: IBoard;

    /**
     * Lists of possible moves indexed by game ply
     */
    public moveList: Move[][];
    /**
     * Lists of scores for each move indexed by game plys
     */
    //public moveScores: Move[][]; // is this needed?
    /**
     * 
     */
    private numMoves: number[];
    /**
     * Move index used to populate move list
     */
    private moveCount = 0;

    constructor(board: IBoard) {
        this.board = board;

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        // these should use MAX_DEPTH
        this.moveList = new Array(MAX_GAME_MOVES);
        //this.moveScores = new Array(MAX_GAME_MOVES);
        this.numMoves = new Array(MAX_GAME_MOVES);
        for (let i = 0; i < MAX_GAME_MOVES; i++) {
            this.moveList[i] = [...emptyMoveArray];
            //this.moveScores[i] = [...emptyMoveArray];
            this.numMoves[i] = 0;
        }
    }

    public * getCurrentMoves(): IterableIterator<Move> {
        for (let i = 0; i < this.numMoves[this.board.ply]; i++) {
            //if (this.moveList[this.board.ply][i] === undefined) continue;
            yield this.moveList[this.board.ply][i];
        }
    }

    /**
     * Generate all possible moves for the current position
     */
    public generateMoves(): number | MoveStatus {
        this.moveCount = 0;
        const ply = this.board.ply;
        const side = this.board.sideToMove;
        const opposingSide = GetOtherSide[side];

        if (side === Color.none) return 0;

        // Sliding pieces
        SlidingPieces[side].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    let totalMove = dir;
                    let sliding = true;
                    while (sliding) {
                        const colorAtSq = PieceColor[this.board.getPiece(sq + totalMove)];
                        if (sqOffboard(sq + totalMove) || colorAtSq === side) break;
                        if (colorAtSq === opposingSide) sliding = false;

                        this.addIfLegal(sliding
                            ? new Move(sq, sq + totalMove)
                            : new Move(sq, sq + totalMove).setCapture());
                        totalMove += dir;
                    }
                }
            }
        });

        // Non sliding pieces
        NonSlidingPieces[side].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    const targetPiece = this.board.getPiece(sq + dir);
                    if (sqOffboard(sq + dir) || PieceColor[targetPiece] === side) continue;
                    
                    this.addIfLegal(PieceColor[targetPiece] !== opposingSide
                        ? new Move(sq, sq + dir)
                        : new Move(sq, sq + dir).setCapture());
                }
            }
        });

        // Pawn moves
        const pawnType = Pawns[side];
        for (const sq of this.board.getSquares(pawnType)) {
            const targetSq = sq + PieceDir[pawnType][side];
            if (PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                if (GetRank[sq] === StartingRank[opposingSide]) {
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Queens[side]));
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Rooks[side]));
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Bishops[side]));
                    this.addIfLegal(new Move(sq, targetSq).setPromotion(Knights[side]));
                }
                else this.addIfLegal(new Move(sq, targetSq));
            }

            const doubleMoveSq = sq + PieceDir[pawnType][side] * 2;
            if (GetRank[sq] === StartingRank[side] && PieceColor[this.board.getPiece(doubleMoveSq)] === Color.none) {
                this.addIfLegal(new Move(sq, doubleMoveSq));
            }

            for (const captureDir of PawnCaptureDir[side]) {
                const captureSq = sq + captureDir;
                if (captureSq === this.board.enPas) {
                    this.addIfLegal(new Move(sq, captureSq).setCapture());
                    continue;
                }
                if (PieceColor[this.board.getPiece(captureSq)] === opposingSide) {
                    if (GetRank[sq] === StartingRank[opposingSide]) {
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Queens[side]));
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Rooks[side]));
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Bishops[side]));
                        this.addIfLegal(new Move(sq, captureSq).setPromotion(Knights[side]));
                    }
                    else this.addIfLegal(new Move(sq, captureSq).setCapture());
                }
            }
        }

        // Castle moves
        if (this.board.hasCastleMoves()) {
            if (side === Color.white && !this.squareAttacked(Square.e1, Color.black)) {
                if (this.board.whiteKingCastle
                    && this.board.getPiece(Square.f1) === Piece.none && !this.squareAttacked(Square.f1, Color.black)
                    && this.board.getPiece(Square.g1) === Piece.none && !this.squareAttacked(Square.g1, Color.black)) {
                    this.addMove(new Move(Square.e1, CastleRightRook[side]));
                }
                if (this.board.whiteQueenCastle
                    && this.board.getPiece(Square.b1) === Piece.none && !this.squareAttacked(Square.b1, Color.black)
                    && this.board.getPiece(Square.c1) === Piece.none && !this.squareAttacked(Square.c1, Color.black)
                    && this.board.getPiece(Square.d1) === Piece.none && !this.squareAttacked(Square.d1, Color.black)) {
                    this.addMove(new Move(Square.e1, CastleLeftRook[side]));
                }
            }
            else if (!this.squareAttacked(Square.e8, Color.white)) {
                if (this.board.blackKingCastle
                    && this.board.getPiece(Square.f8) === Piece.none && !this.squareAttacked(Square.f8, Color.white)
                    && this.board.getPiece(Square.g8) === Piece.none && !this.squareAttacked(Square.g8, Color.white)) {
                    this.addMove(new Move(Square.e1, CastleRightRook[side]));
                }
                if (this.board.blackQueenCastle
                    && this.board.getPiece(Square.b8) === Piece.none && !this.squareAttacked(Square.b8, Color.white)
                    && this.board.getPiece(Square.c8) === Piece.none && !this.squareAttacked(Square.c8, Color.white)
                    && this.board.getPiece(Square.d8) === Piece.none && !this.squareAttacked(Square.d8, Color.white)) {
                    this.addMove(new Move(Square.e1, CastleLeftRook[side]));
                }
            }
        }

        const kingAttacked = this.squareAttacked(this.board.getSquares(Kings[side]).next().value, opposingSide);
        if (this.moveCount === 0 && kingAttacked) return MoveStatus.checkmate;
        
        this.numMoves[ply] = this.moveCount;
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
            const attackingkSq = sq + captureDir;
            if (PieceColor[this.board.getPiece(attackingkSq)] === atkSide) {
                return true;
            }
        }

        // Kings and Knights
        for (const dir of PieceDir[Piece.whiteKing]) {
            if (sqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === atkSide && IsKing[piece]) return true;
        }
        for (const dir of PieceDir[Piece.whiteKnight]) {
            if (sqOffboard(sq + dir)) continue;
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
        this.board.movePiece(move.from, move.to, false);
        const side = this.board.sideToMove;
        const kingSq = this.board.getSquares(Kings[GetOtherSide[side]]).next().value;
        if (!this.squareAttacked(kingSq, side)) {
            this.addMove(move, this.board.ply - 1);
        }
        this.board.undoMove();
    }

    private addMove(move: Move, ply = this.board.ply): void {
        this.insertMove(move, ply, this.getSortedIndex(move));
        this.moveCount++;
    }

    private insertMove(move: Move, ply: number, insertIdx: number): void {
        for (let i = this.moveCount; i > insertIdx; i--) {
            this.moveList[ply][i] = this.moveList[ply][i - 1];
        }
        this.moveList[ply][insertIdx] = move;
    }

    private getSortedIndex(move: Move, start = 0, end = this.numMoves[this.board.ply]): number {
        const array = this.moveList[this.board.ply];
        const pivot = start + (end - start) / 2;

        if (end - start <= 1 || this.moveValue(move) === this.moveValue(array[pivot])) return pivot;

        if (this.moveValue(move) <= this.moveValue(array[pivot]))
            return this.getSortedIndex(move, pivot, end);

        return this.getSortedIndex(move, start, pivot);
    }

    private moveValue(move: Move): number {
        if (move.capture) return 3;
        if (IsQueen[move.promotion]) return 2;
        if (move.promotion !== Piece.none) return 1;
        return 0;
    }
}