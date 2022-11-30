/* --- Constants --- */
export const BOARD_SQ_NUM = 120;
export const INNER_BOARD_SQ_NUM = 64;
export const NUM_CASTLE_COMBINATIONS = 16;
export const MAX_GAME_MOVES = 2048; /*(half moves)*/
export const MAX_POSITION_MOVES = 256; /*used for storing moves in GameBoard.moveList for engine calculation*/
export const MAX_DEPTH = 64;
export const NUM_PIECE_TYPES = 13;
export const MAX_NUM_PER_PIECE = 10;
export const CASTLE_LEFT = -2;
export const CASTLE_RIGHT = 2;
export const INSUFFICENT_MATERIAL = 50325;

/* --- Strings ---  */
export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const PIECE_CHAR = ".PNBRQKpnbrqk";
export const SIDE_CHAR = "wb-";
export const FILE_CHAR = "-abcdefgh";