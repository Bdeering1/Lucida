/* eslint-disable no-magic-numbers */

import { Colour, Piece } from "./enums";

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