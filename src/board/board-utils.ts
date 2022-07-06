/* eslint-disable no-magic-numbers */
import { BOARD_SQ_NUM, INNER_BOARD_SQ_NUM, NUM_PIECE_TYPES } from '../shared/constants';
import { Color, Piece, Rank, Square } from '../shared/enums';

export default class BoardUtils {

    /* --- Empty Maps --- */
    FilesBoard: (File | Square)[];
    RanksBoard: Rank[];
    Sq120ToSq64: Piece[];
    Sq64ToSq120: Piece[];
    PieceKeys: number[];
    CastleKeys: number[];
    SideKey: number; /* hashed in if white is to move*/

    /* --- Maps --- */
    readonly PieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
    readonly PieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
    readonly PieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
    readonly PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000 ];
    readonly PieceCol = [ Color.none, Color.white, Color.white, Color.white, Color.white, Color.white, Color.white,
        Color.black, Color.black, Color.black, Color.black, Color.black, Color.black ];

    readonly IsPawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ]; /* not used so far, needed?*/
    readonly IsKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ]; /* not used either*/
    readonly IsKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ]; /* not used either*/
    readonly IsRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
    readonly IsBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
    readonly IsSliding = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];
    
    readonly PawnDir = [ -10, 10 ];
    readonly KnightDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
    readonly RookDir = [ -1, -10, 1, 10 ];
    readonly BishopDir = [ -9, -11, 11, 9 ];
    readonly KingDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];
    readonly DirIndexes = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
    readonly PieceDir = [ 0, this.PawnDir, this.KnightDir, this.BishopDir, this.RookDir, this.KingDir, this.KingDir, this.PawnDir, this.KnightDir, this.BishopDir, this.RookDir, this.KingDir, this.KingDir ];
    readonly LoopNonSlidePce = [ Piece.whiteKnight, Piece.whiteKing, 0, Piece.blackKnight, Piece.blackKnight, 0 ];
    readonly LoopNonSlideIndex = [ 0, 3 ];
    readonly LoopSlidePce = [ Piece.whiteBishop, Piece.whiteRook, Piece.whiteQueen, 0, Piece.blackBishop, Piece.blackRook, Piece.blackQueen, 0 ];
    readonly LoopSlideIndex = [ 0, 4 ];

    readonly Kings = [ Piece.whiteKing, Piece.blackKnight ];

    readonly CastlePerm = [
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    ];


    public constructor() {
        this.FilesBoard = new Array(BOARD_SQ_NUM);
        this.RanksBoard = new Array(BOARD_SQ_NUM);
        this.Sq120ToSq64 = new Array(BOARD_SQ_NUM);
        this.Sq64ToSq120 = new Array(INNER_BOARD_SQ_NUM);
        this.PieceKeys = new Array(NUM_PIECE_TYPES * BOARD_SQ_NUM);
        this.CastleKeys = new Array(16);
        this.SideKey = this.GetRandom32();
    }

    GetSquare(file : number, rank : number) {
        return 21 + file + (70 - rank * 10);
    }
    Sq64(sq120 : number) {
        return this.Sq120ToSq64[sq120];
    }
    Sq120(sq64 : number) {
        return this.Sq64ToSq120[sq64];
    }
    SqOffboard(sq : number) {
        return this.FilesBoard[sq] === Square.offBoard;
    }
    PieceIndex(piece : number, pieceNum : number) {
        return piece * 10 + pieceNum;
    }

    FromSq(m : number) {
        return m & 0x7F;
    }
    ToSq(m : number) {
        return m >> 7 & 0x7F;
    }
    Captured(m : number) {
        return m >> 14 & 0xF;
    }
    Promoted(m : number) {
        return m >> 20 & 0xF;
    }

    GetRandom32() {
        return Math.floor(Math.random() * 255 + 1) << 23 | Math.floor(Math.random() * 255 + 1) << 16
        | Math.floor(Math.random() * 255 + 1) << 8 | Math.floor(Math.random() * 255 + 1);
    }

    GenerateHash32(seed: number) {
        return ~~(seed * 3575866506);
    }
}