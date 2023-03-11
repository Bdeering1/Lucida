/* eslint-disable no-magic-numbers, indent */
import { Color, Piece, Rank, Square } from './enums';
import { PIECE_CHAR } from './constants';


/* --- Maps --- */
export const PieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
export const PieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
export const PieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
export const PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000 ];
export const PieceAttackVal = [ 0, 3, 3, 3, 2, 1, 1, 3, 3, 3, 2, 1, 1 ];
export const PieceColor = [ Color.none, Color.white, Color.white, Color.white, Color.white, Color.white, Color.white,
    Color.black, Color.black, Color.black, Color.black, Color.black, Color.black ];

export const IsPawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ];
export const IsQueen = [ false, false, false, false, false, true, false, false, false, false, false, true, false ];
export const IsKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ];
export const IsKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ];
export const IsRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
export const IsBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
export const IsSliding = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

export const PawnDir = [ 10, -10 ];
export const KnightDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
export const BishopDir = [ -9, -11, 11, 9 ];
export const RookDir = [ -1, -10, 1, 10 ];
export const KingDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];
export const PawnCaptureDir = [[ 9, 11 ], [ -9, -11 ]];
export const PieceDir = [ [], PawnDir, KnightDir, BishopDir, RookDir, KingDir, KingDir, PawnDir, KnightDir, BishopDir, RookDir, KingDir, KingDir ];
export const CaptureDir = [ [], PawnCaptureDir[Color.white], KnightDir, BishopDir, RookDir, KingDir, KingDir, PawnCaptureDir[Color.black], KnightDir, BishopDir, RookDir, KingDir, KingDir ];
export const NonSlidingPieces = [ [Piece.whiteKnight, Piece.whiteKing],
                                  [Piece.blackKnight, Piece.blackKing] ];
export const SlidingPieces = [ [Piece.whiteBishop, Piece.whiteRook, Piece.whiteQueen],
                               [Piece.blackBishop, Piece.blackRook, Piece.blackQueen] ];

export const Pawns = [ Piece.whitePawn, Piece.blackPawn ];
export const Kings = [ Piece.whiteKing, Piece.blackKing ];
export const Queens = [ Piece.whiteQueen, Piece.blackQueen ];
export const Rooks = [ Piece.whiteRook, Piece.blackRook ];
export const Bishops = [ Piece.whiteBishop, Piece.blackBishop ];
export const Knights = [ Piece.whiteKnight, Piece.blackKnight ];

export const LeftRook = [ Square.a1, Square.a8 ];
export const RightRook = [ Square.h1, Square.h8 ];
export const CastleLeftRook = [ Square.d1, Square.d8 ];
export const CastleRightRook = [ Square.f1, Square.f8 ];

export const GetOtherSide = [ Color.black, Color.white, Color.none ];

export const StartingRank = [ Rank.two, Rank.seven ];
export const EnPasRank = [ Rank.four, Rank.five ];

export const SideMultiplier = [ 1, -1, 0 ];

export const RankToBits = [ 0, 1, 2, 4, 8, 16, 32, 64, 128 ];
export const RankToBitsInverse = [ 255, 254, 253, 251, 247, 239, 223, 191, 127 ];

export const CoverageMultiplier = [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  1,  1,  1,  1,  1,  1,  1,  1,  0,
    0,  1,  1,  1,  1,  1,  1,  1,  1,  0,
    0,  1,  1,  1,  1,  1,  1,  1,  1,  0,
    0,  1,  1,  1,  2,  2,  1,  1,  1,  0,
    0,  1,  1,  1,  2,  2,  1,  1,  1,  0,
    0,  1,  1,  1,  1,  1,  1,  1,  1,  0,
    0,  1,  1,  1,  1,  1,  1,  1,  1,  0,
    0,  1,  1,  1,  1,  1,  1,  1,  1,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
];

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
    99,  8,  9, 10, 11, 12, 13, 14, 15, 99,
    99, 16, 17, 18, 19, 20, 21, 22, 23, 99,
    99, 24, 25, 26, 27, 28, 29, 30, 31, 99,
    99, 32, 33, 34, 35, 36, 37, 38, 39, 99,
    99, 40, 41, 42, 43, 44, 45, 46, 47, 99,
    99, 48, 49, 50, 51, 52, 53, 54, 55, 99,
    99, 56, 57, 58, 59, 60, 61, 62, 63, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

export const CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
];

/* --- Functions --- */
export function getSquare(file : number, rank : number) {
    return 10 + file + rank * 10;
}
export function sqOffboard(sq : number) {
    return GetSq64[sq] === Square.offBoard;
}

export function getFileFromChar(fileStr: string) {
    return fileStr.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}
export function getRankFromChar(rankStr: string) {
    return rankStr.charCodeAt(0) - '1'.charCodeAt(0) + 1;
}

export function generateHash32(seed: number) {
    return ~~((seed + 37) * 3575866506 + seed % 2);
    /* return Math.floor(Math.random() * 255 + 1) << 24 | Math.floor(Math.random() * 255 + 1) << 16
    | Math.floor(Math.random() * 255 + 1) << 8 | Math.floor(Math.random() * 255 + 1); */
}

export function sqFromString(sq: string) {
    return getSquare(getFileFromChar(sq[0]), getRankFromChar(sq[1]));
}

export function pieceFromString(piece: string): Piece {
    for (let p = 0; p < PIECE_CHAR.length; p++) {
        if (piece === PIECE_CHAR[p]) return p;
    }
    return Piece.none;
}