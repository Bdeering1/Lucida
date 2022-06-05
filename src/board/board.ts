import { CastleBit, Colour, Piece, Square } from "../shared/enums";


interface IBoard {
    pieces: Piece[];
    pieceSquares: Square[][]; // was 1D array
    pieceQuantities: number[];

    sideToMove: Colour;
    ply: number;
    enPas: Square;
    fiftyMoveCounter: number;

    material: number[];
    posKey: number;
    history : IBoard[];

    moveList: [][]; // was 1D array
    moveScores: [][]; // was 1D array

    get whiteKingCastle(): boolean;
    get whiteQueenCastle(): boolean;
    get blackKingCastle(): boolean;
    get blackQueenCastle(): boolean;
    setWhiteKingCastle(): void;
    setWhiteQueenCastle(): void;
    setBlackKingCastle(): void;
    setBlackQueenCastle(): void;
    updateCastling(to: Square, from: Square): void; // could be combined with other move making logic
    resetCastling(): void;
}

export default class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public sideToMove: Colour;
    public ply = 0;
    public enPas = Square.none;
    public fiftyMoveCounter = 0;

    public material: number[];
    public posKey: number;
    public history : IBoard[];

    public moveList: [][];
    public moveScores: [][];

    private castlePermissions = 0;

    public constructor(fqn?: string) {

    }

    public get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    
    setWhiteKingCastle(): void {
        throw new Error("Method not implemented.");
    }
    setWhiteQueenCastle(): void {
        throw new Error("Method not implemented.");
    }
    setBlackKingCastle(): void {
        throw new Error("Method not implemented.");
    }
    setBlackQueenCastle(): void {
        throw new Error("Method not implemented.");
    }

    public updateCastling(to: Square, from: Square) {
        throw new Error("Method not implemented.");
    }
    public resetCastling() {
        throw new Error("Method not implemented.");
    }
}   