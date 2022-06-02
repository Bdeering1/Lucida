import { CastleBit, Colour, Piece, Square } from "../shared/enums";


interface IBoard {
    /* Refactor these? */
    pieces: Piece[];
    pieceQuantities: number[];
    pieceSquares: Square[][]; // was 1D array

    sideToMove: Colour;
    ply: number; // need either new obj or new var for engine calculation
    enPas: Square;
    fiftyMoveCounter: number;

    material: number[];
    posKey: number;
    history : IBoard[];

    moveList: [][]; // was 1D array
    moveScores: [][]; // was 1D array
    //moveListStart

    canCastle(piece: CastleBit): boolean;
    updateCastle(to: Square, from: Square): void; // could be combined with other move making logic
    resetCastlePermissions(): void;
}