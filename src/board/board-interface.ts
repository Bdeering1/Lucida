import { Piece, Square, Colour } from "../shared/enums";

export default interface IBoard {
    /**
     * The piece on each square of the board
     */
    pieces: Piece[];
    /**
     * The square each piece is on
     */
    pieceSquares: Square[][]; // was 1D array
    /**
     * Number of each type of piece on the board
     */
    pieceQuantities: number[];

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
     * Stores the material count for each side
     */
    material: number[];
    posKey: number;
    /**
     * Stores the state of the board after each move
     */
    history : IBoard[];

    /**
     * List of possible moves for each game ply
     */
    moveList: [][]; // was 1D array
    /**
     * Move scores for each game ply
     */
    moveScores: [][]; // was 1D array

    /** Upate castling permissions given where the location of a move
     * - could be combined with other move making logic
     */
    updateCastling(to: Square, from: Square): void;

    /**
     * Reset castling permissions to default (all enabled)
     */
    resetCastling(): void;

    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;
}