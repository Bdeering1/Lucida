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
export const PIECES = { EMPTY : 0, wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6, bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12 };

export const FILES = { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
export const RANKS = { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, FILE_NONE:8 };

export const COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

export const CASTLE_BIT = { WKCA:1, WQCA:2, BKCA:4, BQCA:8 };

export const SQUARES = {
    A1:91, B1:92, C1:93, D1:94, E1:95, F1:96, G1:97, H1:98,
    A8:21, B8:22, C8:23, D8:24, E8:25, F8:26, G8:27, H8:28,
    NO_SQ:99, OFFBOARD:100
};