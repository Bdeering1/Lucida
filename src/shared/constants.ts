/* eslint-disable no-magic-numbers, no-shadow */

/* --- Constants --- */
export const BRD_SQ_NUM = 120;
export const MAX_GAME_MOVES = 2048; /*(half moves)*/
export const MAX_POSITION_MOVES = 256; /*used for storing moves in GameBoard.moveList for engine calculation*/
export const MAX_DEPTH = 64;
export const NO_MOVE = 0;

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const PIECE_CHAR = ".PNBRQKpnbrqk"; /*changed from PceChar*/
export const SIDE_CHAR = "wb-";
export const RANK_CHAR = "12345678";
export const FILE_CHAR = "abcdefgh";

/* --- Constant Flags --- */
/*Flags to bitwise AND with*/
export const PAWN_START_FLAG = 0x80000;
export const EN_PAS_FLAG = 0x40000;
export const CASTLE_FLAG = 0x1000000;

export const CAPTURE_FLAG = 0x7C; /*returns a non zero number if there was a capture (including en passant)*/
export const PROMOTION_FLAG = 0xF00000; /*these could be used instead of doing the whole shift*/


/* --- Enums --- */
export enum Piece {
  empty,
  whitePawn,
  whiteKnight,
  whiteBishop,
  whiteRook,
  whiteQueen,
  whiteKing,
  blackPawn,
  blackKnight,
  blackBishop,
  blackRook,
  blackQueen,
  blackKing
}

export enum File {
  a, b, c, d, e, f, g, h,
  none
}
export enum Rank {
  one, two, three, four, five, six, seven, eight,
  none
}

export enum Colour {
  white,
  black,
  both
}

export enum CastleBit {
  whiteKing = 1,
  whiteQueen = 2,
  blackKing = 4,
  blackQueen = 8
}

export enum Square {
    a1 = 91, b1 = 92, c1 = 93, d1 = 94, e1 = 95, f1 = 96, g1 = 97, h1 = 98,
    a8 = 21, b8 = 22, c8 = 23, d8 = 24, e8 = 25, f8 = 26, g8 = 27, h8 = 28,
    noSquare = 99, offBoard = 100
}