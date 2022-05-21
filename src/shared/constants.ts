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
export enum Pieces {
  EMPTY,
  W_PAWN,
  W_KNIGHT,
  W_BISHOP,
  W_ROOK,
  W_QUEEN,
  W_KING,
  B_PAWN,
  B_KNIGHT,
  B_BISHOP,
  B_ROOK,
  B_QUEEN,
  B_KING
}

export enum Files {
  FILE_A,
  FILE_B,
  FILE_C,
  FILE_D,
  FILE_E,
  FILE_F,
  FILE_G,
  FILE_H,
  FILE_NONE
}

export enum Ranks {
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
  FILE_NONE
}

export enum Colours {
  WHITE,
  BLACK,
  BOTH
}

export enum CastleBit {
  W_KING = 1,
  W_QUEEN = 2,
  B_KING = 4,
  B_QUEEN = 8
}

export enum Squares {
    A1=91, B1=92, C1=93, D1=94, E1=95, F1=96, G1=97, H1=98,
    A8=21, B8=22, C8=23, D8=24, E8=25, F8=26, G8=27, H8=28,
    NO_SQ=99, OFF_BOARD=100
}