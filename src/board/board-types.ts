/* eslint-disable no-use-before-define */
import { Color, Piece, Square } from "../shared/enums";

/**
 * Represents all aspects of board state for a given game ply
 */
export interface IBoard {
    /**
     * Stores all data not directly related to the visible state of the board
     */
    meta: IBoardMeta;
    /**
     * Stores the state of the board after each move, enables undo operation
     * @todo should include move/piece information - either move to move generation and update alongside movePiece call, or put in board wrapper class
     */
    //history: IBoardMeta[];

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
     * @todo this should be able to account for castling and en passent
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
    getPieces(): IterableIterator<Piece>;
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
}

/**
 * Meta data asssociated with the board
 * @todo should likely be merged with the board class
 */
export interface IBoardMeta {
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
     * Create a new copy of this object
     */
    copyThis(): IBoardMeta;
    /**
     * Reset castling permissions to default (all enabled)
     */
    resetCastling(): void;

    /**
     * Upate castling permissions, en passent, posKey, side to move, matereial, fiftyMoveCounter, and ply
     */
    update(from: Square, to: Square, piece: Piece): void;

    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;

    HashPiece(piece: Piece, sq: number): void;
    HashCastle(): void;
    HashSide(): void;
    HashEnPas(): void;
}