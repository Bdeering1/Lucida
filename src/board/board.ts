import { CastleBit, Colour, Piece, Square } from "../shared/enums";
import { CastlePerm } from "../shared/utils";
import IBoard from "./board-interface";


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

    public updateCastling(from: Square, to: Square) {
        this.castlePermissions &= CastlePerm[from];
        this.castlePermissions &= CastlePerm[to]; /*in case a rook is captured*/
    }
    public resetCastling() {
        this.castlePermissions = CastleBit.all;
    }

    public get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
}