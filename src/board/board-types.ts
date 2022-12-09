import { Color, Piece, Square } from "../shared/enums";

/**
 * Represents all aspects of board state for a given game ply
 */
export interface IBoard {
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
    repeats: number[];


    get quantities(): number[];
    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;
    hasCastleMoves(): boolean;

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
    movePiece(from: Square, to: Square, promote?: Piece): void;
    /**
     * Whether or not the board has any pawns left (for stalemate detection)
     */
    hasPawns(): boolean;
    /**
     * Returns the piece located on a given square
     */
    getPiece(sq: Square): Piece;
    /**
     * Returns an iterator which yields the piece for each square on the board
     * @description this method makes interfacing with the board easier, and allows
     * for the internal implementation piece states to be easily changed later
     * @todo implement as iterator (is currently a generator)
     */
    getPieces(side?: Color): IterableIterator<Piece>;
    /**
     * Returns an iterator which yields the square for each piece of a certain type (if any)
     * @description this method makes interfacing with the board easier, and allows
     * for the internal implementation piece states to be easily schanged later
     * @todo implement as iterator (is currently a generator)
     */
    getSquares(piece: Piece): IterableIterator<Square>;
    /**
     * Update position key for side to move, en passent, and castling
     */
    updatePositionKey(): void;
    /**
     * Undo the last move made
     */
    undoMove(): void;
    /**
     * Add the current position to the board's history
     */
    appendToHistory(): void;
    /**
    * Restore the board state to how it was at a specified ply, where ply < current ply
    */
    restore(ply: number): void;
    /**
     * Create an identical copy of this instance
     * @todo this may be an implementation detail
     */
    copy(deep: boolean): IBoard;
}