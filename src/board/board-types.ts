/* eslint-disable no-use-before-define */
import { Color, Piece, Square } from "../shared/enums";

export interface IBoard {
    //* --- Core ---
    /**
     * Stores the piece on each square of the board
     * @todo this is likely a private implementation detail
     */
    pieces: Piece[];
    /**
     * Stores the square each piece is on indexed by piece type
     * @todo this is likely a private implementation detail
     */
    pieceSquares: Square[][];
    /**
     * Number of each type of piece on the board
     * @todo this is likely a private implementation detail
     */
    pieceQuantities: number[];

    //* --- Meta Data ---
    /**
     * Stores all data not directly related to the visible state of the board
     */
    meta: IBoardMeta;

    //* --- Move Data ---
    /**
     * Stores the state of the board after each move, enables undo operation
     */
    history: IBoardMeta[];
    /**
     * Lists of possible moves indexed by game ply
     * @todo this likely belongs in another class
     */
    moveList: [][];
    /**
     * Lists of scores for each move indexed by game plys
     * @todo this likely belongs in another class
     */
    moveScores: [][];

    /**
     * Add a piece to the board
     */
    addPiece(piece: Piece, sq: Square): void;
    /**
     * Remove a piece from the board
     */
    removePiece(piece: Piece, sq: Square): void;
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
     * for the internal implementation piece states to be easily schanged later
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
     * Given a square on the inner board and a side, returns whether or not that square is attacked
     */
    isSquareAttacked(sq: Square, side: Color): boolean;
    /**
     * Generate hash key for the current position
     */
    generatePosKey(): void;

    // methods for iterating over possible moves by piece
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
     * Reset castling permissions to default (all enabled)
     */
    resetCastling(): void; // this may not be necessary for the interface

    /**
     * Upate castling permissions, en passent, posKey, side to move, and material
     */
    update(from: Square, to: Square, pieceFrom: Piece, pieceTo: Piece): void;

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