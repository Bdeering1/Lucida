/* eslint-disable no-use-before-define */

import { Colour, Piece, Square } from "../shared/enums";

export interface IBoardSetup {
    /**
     * Reset board to starting position
     */
    reset(): void
    /**
     * Set board according to an FEN string
     */
    parseFen(fen: string): void;
}

export interface IBoard {
    //* --- Core ---
    /**
     * Stores the piece on each square of the board
     */
    pieces: Piece[];
    /**
     * Stores the square each piece is on indexed by piece type
     */
    pieceSquares: Square[][];
    /**
     * Number of each type of piece on the board
     */
    pieceQuantities: number[];

    /**
     * Given a square on the inner board and a side, returns whether or not that square is attacked
     */
    isSquareAttacked(sq: Square, side: Colour): boolean;

    //* --- Meta Data ---
    /**
     * Stores all data not directly related to the visible state of the board
     */
    meta: IBoardMeta;

    //* --- Move Data ---
    /**
     * Stores the state of the board after each move
     * - honestly not sure what this is for
     */
    history: IBoardMeta[];
    /**
     * Lists of possible moves indexed by game ply
     */
    moveList: [][];
    /**
     * Lists of scores for each move indexed by game plys
     */
    moveScores: [][];
}

export interface IBoardMeta { // this is only separate from the board 
    /**
     * The current side to move
     */
    sideToMove: Colour;
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
     * Stores the material count for each side, indexed using `Colour` enum
     */
    material: number[];


    /**
     * Upate castling permissions and en passent
     */
    update(from: Square, to: Square): void;
    /**
     * Reset castling permissions to default (all enabled)
     */
    resetCastling(): void; // this may not be necessary for the interface

    // this might be part of updateMeta
    // hashPiece(): void;
    // hashSide(): void;
    // hashCastle(): void;
    // hashEnPas(): void;

    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;
}