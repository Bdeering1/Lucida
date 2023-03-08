import { Color, Piece, Square } from "../shared/enums";
import { IAttackTable } from "./attack-table";
import Move from "../game/move";

/**
 * Represents all aspects of board state for a given game ply
 */
export interface IBoard {
    attackTable: IAttackTable;

    /**
     * The current side to move
     */
    sideToMove: Color;
    /**
     * Current half move number
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
     * Stores the material count for each side, indexed using `Color` enum
     */
    material: number[];
    /**
     * Unique key for each position, used for repetition detection
     */
    posKey: number;
    /**
     * Position keys that have been repeated once
     */
    repeats: Map<number, number>;


    get hasPawns(): boolean;
    get quantities(): Int32Array;
    get hasCastleMoves(): boolean;

    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;

    /**
     * Add a piece to the board
     */
    addPiece(piece: Piece, sq: Square): void;
    /**
     * Remove a piece from the board
     * @todo this may be an implementation detail
     */
    removePiece(sq: Square): void;
    
    /**
     * Move a piece to another square (updates history and ply)
     * @description Does not check for legality
     * @todo this should just take a Move object
     */
    makeMove(move: Move): void;
    /**
     * Undo the last move made
     */
    undoMove(move: Move): void;

    /**
     * Returns the piece located on a given square
     */
    getPiece(sq: Square): Piece;
    /**
     * Returns an iterator which yields the square for each piece of a certain type (if any)
     * @description this method makes interfacing with the board easier, and allows
     * for the internal implementation piece states to be easily schanged later
     * @todo implement as iterator (is currently a generator)
     */
    getSquares(piece: Piece): IterableIterator<Square>;

    /**
     * 
     */
    reset(): void;
    /**
     * Create an identical copy of this instance
     * @todo this may be an implementation detail
     */
    clone(deep: boolean): IBoard;
    /**
    * Restore this object to a specific instance of the board
    */
    restore(board: IBoard): void;
    /**
     * Update position key for side to move, en passent, and castling
     */
    updatePositionKey(): void;
}