/* --- Constants --- */
export const BRD_SQ_NUM = 120;
export const MAXGAMEMOVES = 2048; /*(half moves)*/
export const MAXPOSITIONMOVES = 256; /*used for storing moves in GameBoard.moveList for engine calculation*/
export const MAXDEPTH = 64;
export const NOMOVE = 0;

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const PieceChar = ".PNBRQKpnbrqk"; /*changed from PceChar*/
export const SideChar = "wb-";
export const RankChar = "12345678";
export const FileChar = "abcdefgh";

/* --- Constant Flags --- */
/*Flags to bitwise AND with*/
export const MFLAGPS = 0x80000;
export const MFLAGEP = 0x40000;
export const MFLAGCA = 0x1000000;

export const MFLAGCAP = 0x7C; /*returns a non zero number if there was a capture (including en passant)*/
export const MFLAGPROM = 0xF00000; /*these could be used instead of doing the whole shift*/