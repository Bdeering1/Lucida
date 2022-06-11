import { CastleBit, Colour, Piece, Square } from "../shared/enums";
import { IBoard, IBoardMeta } from "./board-types";


export class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public isSquareAttacked(sq: Square, side: Colour): boolean {
        throw new Error("Method not implemented.");
    }

    public meta: IBoardMeta;
    public history : IBoardMeta[];
    public moveList: [][];
    public moveScores: [][];
}


export class BoardMeta implements IBoardMeta {
    public sideToMove: Colour.both;
    public ply = 0;
    public enPas = Square.none;
    public castlePermissions = CastleBit.none;
    public fiftyMoveCounter = 0;
    public posKey: number;
    public material: number[];

    update(from: Square, to: Square): void {
        throw new Error("Method not implemented.");
    }
    resetCastling(): void {
        throw new Error("Method not implemented.");
    }

    public get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    public setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    public setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    public setBlackKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    public setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
}