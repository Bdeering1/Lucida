import { CastleBit, Square } from "../shared/enums";
import { IBoard, IBoardData } from "./board-types";
import { BoardData } from "./board-data";
import { CastlePerm } from "../shared/utils";

export default class Board implements IBoard {
    private data: IBoardData;

    public constructor(fqn?: string) {
        this.data = new BoardData();
    }

    resetBoard(): void {
        throw new Error("Method not implemented.");
    }
    parseFen(fen: string): void {
        throw new Error("Method not implemented.");
    }
    isSquareAttacked(): boolean {
        throw new Error("Method not implemented.");
    }

    public updateCastling(from: Square, to: Square) {
        this.data.meta.castlePermissions &= CastlePerm[from];
        this.data.meta.castlePermissions &= CastlePerm[to]; /*in case a rook is captured*/
    }
    public resetCastling() {
        this.data.meta.castlePermissions = CastleBit.all;
    }

    hashPiece(): void {
        throw new Error("Method not implemented.");
    }
    hashSide(): void {
        throw new Error("Method not implemented.");
    }
    hashCastle(): void {
        throw new Error("Method not implemented.");
    }
    hashEnPas(): void {
        throw new Error("Method not implemented.");
    }
    
    public get whiteKingCastle() { return (this.data.meta.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.data.meta.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.data.meta.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.data.meta.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
    setBlackKingCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
    setBlackQueenCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }

    private updateListsMaterial(): void {
        throw new Error("Method not implemented.");

    }
    private generatePositionKey(): void {
        throw new Error("Method not implemented.");
    }
}