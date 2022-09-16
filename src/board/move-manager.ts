import { Color, GameResult, Piece, Square } from "../shared/enums";
import { StartingRank, GetRank, NonSlidingPieces, PawnCaptureDir, Pawns, PieceColor, PieceDir, SlidingPieces, SqOffboard, CastleRightRook, CastleLeftRook } from "./board-utils";
import { MAX_DEPTH, MAX_POSITION_MOVES } from "../shared/constants";
import { IBoard } from "./board-types";

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
        let moveIndex = 0;
        const ply = this.board.ply;
        const side = this.board.sideToMove;
        const opposingSide = side === Color.white ? Color.black : Color.white;

        // side specific moves
        if (side === Color.none) {
            return 0;
        }
        else if (side === Color.white && !this.isSquareAttacked(Square.e1, Color.black)) {
            if (this.board.whiteKingCastle
                && this.board.getPiece(Square.f1) === Piece.none && !this.isSquareAttacked(Square.f1, Color.black)
                && this.board.getPiece(Square.g1) === Piece.none && !this.isSquareAttacked(Square.g1, Color.black)) {
                this.moveList[ply][moveIndex++] = new Move(Square.e1, CastleRightRook[side]);
            }
            if (this.board.whiteQueenCastle
                && this.board.getPiece(Square.b1) === Piece.none && !this.isSquareAttacked(Square.b1, Color.black)
                && this.board.getPiece(Square.c1) === Piece.none && !this.isSquareAttacked(Square.c1, Color.black)
                && this.board.getPiece(Square.d1) === Piece.none && !this.isSquareAttacked(Square.d1, Color.black)) {
                this.moveList[ply][moveIndex++] = new Move(Square.e1, CastleLeftRook[side]);
            }
        }
        else if (!this.isSquareAttacked(Square.e8, Color.white)) {
            if (this.board.blackKingCastle
                && this.board.getPiece(Square.f8) === Piece.none && !this.isSquareAttacked(Square.f8, Color.white)
                && this.board.getPiece(Square.g8) === Piece.none && !this.isSquareAttacked(Square.g8, Color.white)) {
                this.moveList[ply][moveIndex++] = new Move(Square.e1, CastleRightRook[side]);
            }
            if (this.board.blackQueenCastle
                && this.board.getPiece(Square.b8) === Piece.none && !this.isSquareAttacked(Square.b8, Color.white)
                && this.board.getPiece(Square.c8) === Piece.none && !this.isSquareAttacked(Square.c8, Color.white)
                && this.board.getPiece(Square.d8) === Piece.none && !this.isSquareAttacked(Square.d8, Color.white)) {
                this.moveList[ply][moveIndex++] = new Move(Square.e1, CastleLeftRook[side]);
            }
        }

        // pawn moves
        const pawnType = Pawns[side];
        for (const sq of this.board.getSquares(pawnType)) {
            let targetSq = sq + PieceDir[pawnType][side];
            if (PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                this.moveList[ply][moveIndex++] = new Move(sq, targetSq);
            }
            targetSq = sq + PieceDir[pawnType][side] * 2;
            if (GetRank[sq] === StartingRank[side] && PieceColor[this.board.getPiece(targetSq)] === Color.none) {
                this.moveList[ply][moveIndex++] = new Move(sq, targetSq);
            }
            for (const captureDir of PawnCaptureDir[side]) {
                const captureSq = sq + captureDir;
                if (PieceColor[this.board.getPiece(captureSq)] === opposingSide || captureSq === this.board.enPas) {
                    this.moveList[ply][moveIndex++] = new Move(sq, captureSq);
                }
            }
        }

        // non sliding pieces
        NonSlidingPieces[side].forEach(piece => {
            for (const sq of this.board.getSquares(piece)) {
                for (const dir of PieceDir[piece]) {
                    if (SqOffboard(sq + dir) || PieceColor[this.board.getPiece(sq + dir)] === side) continue;
                    this.moveList[ply][moveIndex++] = new Move(sq, sq + dir);
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
                        this.moveList[ply][moveIndex++] = new Move(sq, sq + totalMove);
                        totalMove += dir;
                    }
                }
            }
        });

        return moveIndex;
    }

    /**
     * Given a square on the inner board and a side, returns whether or not that square is attacked
     */
    public isSquareAttacked(sq: Square, side: Color): boolean {
        return false;
    }

    /**
     * Determine if the game has ended, and if so, what the result was
     */
    private CheckGameEnded() {
        throw new Error("Method not implemented.");
    }
}