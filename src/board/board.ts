import { CastleBit, Colour, Piece, Square } from "../shared/enums";
import { IBoard, IBoardMeta } from "./board-types";


export class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public meta: IBoardMeta;
    public history : IBoardMeta[];
    public moveList: [][];
    public moveScores: [][];

    constructor(meta: IBoardMeta) {
        this.meta = meta;
    }

    addPiece(piece: Piece, sq: Square): void {
        throw new Error("Method not implemented.");
    }
    getPiece(sq: Square): Piece {
        throw new Error("Method not implemented.");
    }
    getPieces(): IterableIterator<Piece> {
        throw new Error("Method not implemented.");
    }
    getSquares(piece: Piece): IterableIterator<Square> {
        throw new Error("Method not implemented.");
    }

    updateMeta(from: Square, to: Square): void {
        throw new Error("Method not implemented.");
    }

    public isSquareAttacked(sq: Square, side: Colour): boolean {
        throw new Error("Method not implemented.");
    }
}


export class BoardMeta implements IBoardMeta {
    public sideToMove: Colour.both;
    public ply = 0;
    public enPas = Square.none;
    public castlePermissions = CastleBit.none;
    public fiftyMoveCounter = 0;
    public posKey: number;
    public material: number[];

    constructor() {
        this.castlePermissions = CastleBit.none;
    }

    resetCastling(): void {
        this.castlePermissions = CastleBit.none;
    }

    public get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    public setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    public setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    public setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    public setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
}