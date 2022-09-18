/* eslint-disable no-use-before-define */
import { CastleBit, Color, Piece, Square } from "../shared/enums";

/**
 * Represents all aspects of board state for a given game ply
 */
export interface IBoard {
    /**
     * The current side to move
     */
    sideToMove: Color;
    /**
     * Current (half-)move number
     */
    ply: number;
    /**
     * The current square a pawn can 'capture' en passent, if any
     */
    enPas: Square;
    /**
     * Running counter for the fifty move rule
     */
    fiftyMoveCounter: number;
    /**
     * Unique key for each position, used for repetition detection
     */
    posKey: number;
    /**
     * Stores the material count for each side, indexed using `Color` enum
     */
    material: number[];

    /**
     * Add a piece to the board
     */
    addPiece(piece: Piece, sq: Square): void;
    /**
     * Remove a piece from the board
     */
    removePiece(sq: Square): void;
    /**
     * Move a piece to another squares
     */
    movePiece(from: Square, to: Square): void;
    /**
     * Returns the piece located on a given square
     */
    getPiece(sq: Square): Piece;
    /**
     * Returns an iterator which yields the piece for each square on the board
     * @description this method makes interfacing with the board easier, and allows
     * for the internal implementation piece states to be easily changed later
     * @todo implement as a generator at first, but later as a iterator (faster)
     */
    getPieces(side?: Color): IterableIterator<Piece>;
    /**
     * Returns an iterator which yields the square for each piece of a certain type (if any)
     * @description this method makes interfacing with the board easier, and allows
     * for the internal implementation piece states to be easily schanged later
     * @todo implement as a generator at first, but later as a iterator (faster)
     */
    getSquares(piece: Piece): IterableIterator<Square>;
    /**
     * Update position key for side to move, en passent, and castling
     */
    updatePositionKey(): void;
    /**
     * Create an identical copy of this instance
     */
    copy(deep: boolean): IBoard;
    /**
     * Restore the board state to how it was at a specified ply, where ply < current ply
     */
    restore(ply: number): void;

    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;

    hashPiece(piece: Piece, sq: number): void;
    hashCastle(): void;
    hashSide(): void;
    hashEnPas(): void;
}