/* eslint-disable no-magic-numbers */

import { Colour, Piece, Square } from './enums';
import { BOARD_SQ_NUM } from './constants.js';

export class BoardUtils {
    /* --- Empty Maps --- */
    static FilesBoard = new Array(BOARD_SQ_NUM);
    static RanksBoard = new Array(BOARD_SQ_NUM);
    /* Piece * 120 + square (gives 120 space for each piece type and with the square number added on top ensures the key is unique) */
    static PieceKeys = new Array(13 * 120);
    static SideKey = Rand32(); /* hashed in if white is to move*/
    static CastleKeys = new Array(16);
    static Sq120ToSq64 = new Array(BOARD_SQ_NUM);
    static Sq64ToSq120 = new Array(64);
}

/* --- Functions --- */
export function GetSquare(file : number, rank : number) {
    return 21 + file + (70 - rank * 10);
}
export function Sq64(sq120 : number) {
    return BoardUtils.Sq120ToSq64[sq120];
}
export function Sq120(sq64 : number) {
    return BoardUtils.Sq64ToSq120[sq64];
}
export function SqOffboard(sq : number) {
    return BoardUtils.FilesBoard[sq] === Square.offBoard;
}
export function PieceIndex(piece : number, pieceNum : number) {
    return piece * 10 + pieceNum;
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

export function Rand32() {
    return Math.floor(Math.random() * 255 + 1) << 23 | Math.floor(Math.random() * 255 + 1) << 16
       | Math.floor(Math.random() * 255 + 1) << 8 | Math.floor(Math.random() * 255 + 1);
}

/* --- Maps --- */
export const PieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
export const PieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
export const PieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
export const PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000 ];
export const PieceCol = [ Colour.both, Colour.white, Colour.white, Colour.white, Colour.white, Colour.white, Colour.white,
    Colour.black, Colour.black, Colour.black, Colour.black, Colour.black, Colour.black ];

export const PiecePawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ]; /* not used so far, needed?*/
export const PieceKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ]; /* not used either*/
export const PieceKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ]; /* not used either*/
export const PieceRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
export const PieceBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
export const PieceSlides = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

// add pawn dir?
export const NDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
export const RDir = [ -1, -10, 1, 10 ];
export const BDir = [ -9, -11, 11, 9 ];
export const KDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];

export const DirNum = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
export const PceDir = [ 0, 0, NDir, BDir, RDir, KDir, KDir, 0, NDir, BDir, RDir, KDir, KDir ];

export const LoopNonSlidePce = [ Piece.whiteKnight, Piece.whiteKing, 0, Piece.blackKnight, Piece.blackKnight, 0 ];
export const LoopNonSlideIndex = [ 0, 3 ];
export const LoopSlidePce = [ Piece.whiteBishop, Piece.whiteRook, Piece.whiteQueen, 0, Piece.blackBishop, Piece.blackRook, Piece.blackQueen, 0 ];
export const LoopSlideIndex = [ 0, 4 ];

export const Kings = [ Piece.whiteKing, Piece.blackKnight ];

export const CastlePerm = [ /* this could possibly be more efficient if it was an object map with 4 values */
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