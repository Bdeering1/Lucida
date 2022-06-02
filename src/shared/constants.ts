/* eslint-disable no-magic-numbers */

/* --- Constants --- */
export const BOARD_SQ_NUM = 120;
export const INNER_BOARD_SQ_NUM = 64;
export const MAX_GAME_MOVES = 2048; /*(half moves)*/
export const MAX_POSITION_MOVES = 256; /*used for storing moves in GameBoard.moveList for engine calculation*/
export const MAX_DEPTH = 64;
export const NO_MOVE = 0;
export const NUM_PIECE_TYPES = 13;
export const MAX_NUM_PER_PIECE = 1;

/* --- Strings ---  */
export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const PIECE_CHAR = ".PNBRQKpnbrqk"; /*changed from PceChar*/
export const SIDE_CHAR = "wb-";
export const RANK_CHAR = "12345678";
export const FILE_CHAR = "abcdefgh";

/* --- Flags --- */
export const PAWN_START_FLAG = 0x80000;
export const EN_PAS_FLAG = 0x40000;
export const CASTLE_FLAG = 0x1000000;

export const CAPTURE_FLAG = 0x7C; /*returns a non zero number if there was a capture (including en passant)*/
export const PROMOTION_FLAG = 0xF00000; /*these could be used instead of doing the whole shift*/