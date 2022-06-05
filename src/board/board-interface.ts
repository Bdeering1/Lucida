import { Colour, Piece, Square } from "../shared/enums";

export default interface IBoard {
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
    /**
     * Unique key for each position, used for repetition detection
     */
    posKey: number;

    /**
     * Stores the state of the board after each move
     * - honestly not sure what this is for
     */
    history?: IBoard[];
    /**
     * Lists of possible moves indexed by game ply
     */
    moveList?: [][];
    /**
     * Lists of scores for each move indexed by game plys
     */
    moveScores?: [][];

    /**
     * Upate castling permissions given where the location of a move
     * - could be combined with other move making logic
     */
    updateCastling(from: Square, to: Square): void;

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