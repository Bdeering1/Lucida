/* --- Enums --- */
export const PIECES = { EMPTY : 0, wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6, bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12 };

export const FILES = { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
export const RANKS = { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, FILE_NONE:8 };

export const COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

export const CASTLEBIT = { WKCA:1, WQCA:2, BKCA:4, BQCA:8 };

export const SQUARES = {
    A1:91, B1:92, C1:93, D1:94, E1:95, F1:96, G1:97, H1:98,
    A8:21, B8:22, C8:23, D8:24, E8:25, F8:26, G8:27, H8:28,
    NO_SQ:99, OFFBOARD:100
};