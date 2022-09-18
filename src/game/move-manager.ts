import { Color, GameResult, Piece, Square } from "../shared/enums";
import { StartingRank, GetRank, NonSlidingPieces, PawnCaptureDir, Pawns, PieceColor, PieceDir, SlidingPieces, SqOffboard, CastleRightRook, CastleLeftRook, Kings, IsKing, IsKnight, IsBishopQueen, IsRookQueen } from "../shared/utils";
import { MAX_DEPTH, MAX_POSITION_MOVES } from "../shared/constants";
import { IBoard } from "../board/board-types";

export class Move {
    public from: Square;
    public to: Square;

    public constructor(from: Square, to: Square) {
        this.from = from;
        this.to = to;
    }

    public static NoMove() {
        return new Move(Square.none, Square.none);
    }

    public isNoMove() {
        return this.from === Square.none;
    }
}

export default class MoveManager {
    private board: IBoard;

    /**
     * Lists of possible moves indexed by game ply
     */
    public moveList: Move[][];
    /**
     * Lists of scores for each move indexed by game plys
     */
    public moveScores: Move[][];
    /**
     * Result of the game
     * @todo this might belong in another class - there could be a game class which can be written to by the board or move classes
     */
    public gameResult = GameResult.none;
    /**
     * Move index used to populate move list
     */
    private moveIndex = 0;

    constructor(board: IBoard) {
        this.board = board;

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_DEPTH);
        this.moveScores = new Array(MAX_DEPTH);
        for (let i = 0; i < MAX_DEPTH; i++) {
            this.moveList[i] = [...emptyMoveArray];
            this.moveScores[i] = [...emptyMoveArray];
        }
    }

    /**
     * Generate all possible moves for the current position
     * @todo this method needs to account for checks
     */
    public generateMoves(): number {
        this.moveIndex = 0;
        const ply = this.board.ply;
        const side = this.board.sideToMove;
        const opposingSide = side === Color.white ? Color.black : Color.white;

        // side specific moves
        if (side === Color.none) {
            return 0;
        }
        else if (side === Color.white && !this.squareAttacked(Square.e1, Color.black)) {
            if (this.board.whiteKingCastle
                && this.board.getPiece(Square.f1) === Piece.none && !this.squareAttacked(Square.f1, Color.black)
                && this.board.getPiece(Square.g1) === Piece.none && !this.squareAttacked(Square.g1, Color.black)) {
                this.moveList[ply][this.moveIndex++] = new Move(Square.e1, CastleRightRook[side]);
            }
            if (this.board.whiteQueenCastle
                && this.board.getPiece(Square.b1) === Piece.none && !this.squareAttacked(Square.b1, Color.black)
                && this.board.getPiece(Square.c1) === Piece.none && !this.squareAttacked(Square.c1, Color.black)
                && this.board.getPiece(Square.d1) === Piece.none && !this.squareAttacked(Square.d1, Color.black)) {
                this.moveList[ply][this.moveIndex++] = new Move(Square.e1, CastleLeftRook[side]);
            }
        }
        else if (!this.squareAttacked(Square.e8, Color.white)) {
            if (this.board.blackKingCastle
                && this.board.getPiece(Square.f8) === Piece.none && !this.squareAttacked(Square.f8, Color.white)
                && this.board.getPiece(Square.g8) === Piece.none && !this.squareAttacked(Square.g8, Color.white)) {
                this.moveList[ply][this.moveIndex++] = new Move(Square.e1, CastleRightRook[side]);
            }
            if (this.board.blackQueenCastle
                && this.board.getPiece(Square.b8) === Piece.none && !this.squareAttacked(Square.b8, Color.white)
                && this.board.getPiece(Square.c8) === Piece.none && !this.squareAttacked(Square.c8, Color.white)
                && this.board.getPiece(Square.d8) === Piece.none && !this.squareAttacked(Square.d8, Color.white)) {
                this.moveList[ply][this.moveIndex++] = new Move(Square.e1, CastleLeftRook[side]);
            }
        }

        // pawn moves
        const pawnType = Pawns[side];
        for (const sq of this.board.getSquares(pawnType)) {
            let targetSq = sq + PieceDir[pawnType][side];
            if (PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                this.addIfLegal(new Move(sq, targetSq), side);
            }
            targetSq = sq + PieceDir[pawnType][side] * 2;
            if (GetRank[sq] === StartingRank[side] && PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                this.addIfLegal(new Move(sq, targetSq), side);
            }
            for (const captureDir of PawnCaptureDir[side]) {
                const captureSq = sq + captureDir;
                if (PieceColor[this.board.getPiece(captureSq)] === opposingSide || captureSq === this.board.enPas) {
                    this.addIfLegal(new Move(sq, captureSq), side);
                }
            }
        }

        // non sliding pieces
        NonSlidingPieces[side].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    if (SqOffboard(sq + dir) || PieceColor[this.board.getPiece(sq + dir)] === side) continue;
                    this.addIfLegal(new Move(sq, sq + dir), side);
                }
            }
        });

        // sliding pieces
        SlidingPieces[side].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    let totalMove = dir;
                    let sliding = true;
                    while (sliding) {
                        const colorAtSq = PieceColor[this.board.getPiece(sq + totalMove)];
                        if (SqOffboard(sq + totalMove) || colorAtSq === side) break;
                        if (colorAtSq === opposingSide) sliding = false;
                        this.addIfLegal(new Move(sq, sq + totalMove), side);
                        totalMove += dir;
                    }
                }
            }
        });

        return this.moveIndex;
    }

    /**
     * Given a square on the inner board and a side, returns whether or not that square is attacked
     */
    public squareAttacked(sq: Square, atkSide: Color): boolean {
        const defSide = atkSide === Color.white ? Color.black : Color.white;
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
            if (SqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === atkSide && IsKing[piece]) return true;
        }
        for (const dir of PieceDir[Piece.whiteKnight]) {
            if (SqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === atkSide && IsKnight[piece]) return true;
        }

        // Bishops, Rooks, and Queens
        for (const dir of PieceDir[Piece.whiteBishop]) {
            let totalMove = dir;
            while (true) {
                const piece = this.board.getPiece(sq + totalMove);
                const colorAtSq = PieceColor[piece];
                if (SqOffboard(sq + totalMove) || colorAtSq === defSide) break;
                if (colorAtSq === atkSide && IsBishopQueen[piece]) return true;
                totalMove += dir;
            }
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            let totalMove = dir;
            while (true) {
                const piece = this.board.getPiece(sq + totalMove);
                const colorAtSq = PieceColor[piece];
                if (SqOffboard(sq + totalMove) || colorAtSq === defSide) break;
                if (colorAtSq === atkSide && IsRookQueen[piece]) return true;
                totalMove += dir;
            }
        }

        return false;
    }
    /**
     * Adds a move to the move list if a given move allows the king to be taken on the next move
     */
    private addIfLegal(move: Move, side: Color): void {
        this.board.movePiece(move.from, move.to);
        const kingSq = this.board.getSquares(Kings[side]).next().value;
        if (!this.squareAttacked(kingSq, this.board.sideToMove)) {
            this.moveList[this.board.ply - 1][this.moveIndex++] = move;
        }
        this.board.restore(this.board.ply - 1);
    }
}