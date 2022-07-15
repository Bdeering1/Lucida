/* eslint-disable no-magic-numbers */
import { Color, Piece, Rank, Square } from '../shared/enums';


/* --- Maps --- */
export const PieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
export const PieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
export const PieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
export const PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000 ];
export const PieceColor = [ Color.none, Color.white, Color.white, Color.white, Color.white, Color.white, Color.white,
    Color.black, Color.black, Color.black, Color.black, Color.black, Color.black ];

export const IsPawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ]; /* not used so far, needed?*/
export const IsKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ]; /* not used either*/
export const IsKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ]; /* not used either*/
export const IsRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
export const IsBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
export const IsSliding = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

export const PawnDir = [ -10, 10 ];
export const KnightDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
export const RookDir = [ -1, -10, 1, 10 ];
export const BishopDir = [ -9, -11, 11, 9 ];
export const KingDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];
export const DirIndexes = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
export const PieceDir = [ 0, PawnDir, KnightDir, BishopDir, RookDir, KingDir, KingDir, PawnDir, KnightDir, BishopDir, RookDir, KingDir, KingDir ];
export const EnPasRank = [ Rank.two, Rank.seven ];
export const NonSlidingPiecess = [ Piece.whiteKnight, Piece.whiteKing, 0, Piece.blackKnight, Piece.blackKnight, 0 ];
export const NonSlidingPieceIdx = [ 0, 3 ];
export const SlidingPieces = [ Piece.whiteBishop, Piece.whiteRook, Piece.whiteQueen, 0, Piece.blackBishop, Piece.blackRook, Piece.blackQueen, 0 ];
export const SlidingPieceIdx = [ 0, 4 ];

export const Kings = [ Piece.whiteKing, Piece.blackKnight ];
export const Rooks = [ Piece.whiteRook, Piece.blackRook ];

export const GetFile = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const GetRank = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 2, 2, 2, 2, 2, 2, 2, 2, 0,
    0, 3, 3, 3, 3, 3, 3, 3, 3, 0,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 0,
    0, 5, 5, 5, 5, 5, 5, 5, 5, 0,
    0, 6, 6, 6, 6, 6, 6, 6, 6, 0,
    0, 7, 7, 7, 7, 7, 7, 7, 7, 0,
    0, 8, 8, 8, 8, 8, 8, 8, 8, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const GetSq120 = [
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98,
];

export const GetSq64 = [
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99,  0,  1,  2,  3,  4,  5,  6,  7, 99,
    99, 10, 11, 12, 13, 14, 15, 16, 17, 99,
    99, 20, 21, 22, 23, 24, 25, 26, 27, 99,
    99, 30, 31, 32, 33, 34, 35, 36, 37, 99,
    99, 40, 41, 42, 43, 44, 45, 46, 47, 99,
    99, 50, 51, 52, 53, 54, 55, 56, 57, 99,
    99, 60, 61, 62, 63, 64, 65, 66, 67, 99,
    99, 70, 71, 72, 73, 74, 75, 76, 77, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

export const CastlePerm = [
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

/* --- Functions --- */
export function GetSquare(file : number, rank : number) {
    return 10 + file + rank * 10;
}
export function SqOffboard(sq : number) {
    return GetSq64[sq] === Square.offBoard;
}

export function FromSq(m : number) {
    return m & 0x7F;
}
export function ToSq(m : number) {
    return m >> 7 & 0x7F;
}
export function Captured(m : number) {
    return m >> 14 & 0xF;
}
export function Promoted(m : number) {
    return m >> 20 & 0xF;
}

export function GenerateHash32(seed: number) {
    return ~~((seed + 37) * 3575866506 + seed % 2);
    /* return Math.floor(Math.random() * 255 + 1) << 24 | Math.floor(Math.random() * 255 + 1) << 16
    | Math.floor(Math.random() * 255 + 1) << 8 | Math.floor(Math.random() * 255 + 1); */
}