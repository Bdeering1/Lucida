import { CastleBit, Colour, Piece, Square } from "../shared/enums";
import { IBoard, IBoardData, IBoardMeta } from "./board-interface";
import { CastlePerm } from "../shared/utils";

export class Board implements IBoard {
    private data: IBoardData;

    public updateCastling(from: Square, to: Square) {
        this.data.meta.castlePermissions &= CastlePerm[from];
        this.data.meta.castlePermissions &= CastlePerm[to]; /*in case a rook is captured*/
    }
    public resetCastling() {
        this.data.meta.castlePermissions = CastleBit.all;
    }
    
    public get whiteKingCastle() { return (this.data.meta.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.data.meta.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.data.meta.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.data.meta.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
    setBlackKingCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
    setBlackQueenCastle(): void { this.data.meta.castlePermissions |= CastleBit.whiteKing; }
}

export class BoardData implements IBoardData {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public meta: IBoardMeta;

    public history : IBoardMeta[];
    public moveList: [][];
    public moveScores: [][];

    public constructor(fqn?: string) {

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
}