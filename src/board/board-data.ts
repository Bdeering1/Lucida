import { CastleBit, Colour, Piece, Square } from "../shared/enums";
import { IBoardData, IBoardMeta } from "./board-types";


export class BoardData implements IBoardData {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

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
}