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


/* --- Maps --- */
export var PieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
export var PieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
export var PieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
export var PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000 ];
export var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
export var PiecePawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ]; /*not used so far, needed?*/
export var PieceKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ]; /*not used either*/
export var PieceKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ]; /*not used either*/
export var PieceRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
export var PieceBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
export var PieceSlides = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

export var NDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
export var RDir = [ -1, -10, 1, 10 ];
export var BDir = [ -9, -11, 11, 9 ];
export var KDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];

export var DirNum = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
export var PceDir = [ 0, 0, NDir, BDir, RDir, KDir, KDir, 0, NDir, BDir, RDir, KDir, KDir ];

export var LoopNonSlidePce = [ PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0 ];
export var LoopNonSlideIndex = [ 0, 3 ];
export var LoopSlidePce = [ PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
export var LoopSlideIndex = [ 0, 4];

export var Kings = [PIECES.wK, PIECES.bK];

export var CastlePerm = [ /* this could possibly be more efficient if it was an object map with 4 values */
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


/* --- Empty Maps --- */
export var FilesBoard = new Array(BRD_SQ_NUM);
export var RanksBoard = new Array(BRD_SQ_NUM);

/* Piece * 120 + square (gives 120 space for each piece type and with the square number added on top ensures the key is unique) */
export var PieceKeys = new Array(13 * 120);
export var SideKey = RAND_32(); /* hashed in if white is to move*/
export var CastleKeys = new Array(16);

export var Sq120ToSq64 = new Array(BRD_SQ_NUM);
export var Sq64ToSq120 = new Array(64); /*populated in main*/


/* --- Functions --- */
export function FR2SQ(f,r) {
    return ( 21 + (f) ) + ( 70 - ((r) * 10) );
}
export function SQ64(sq120) { return Sq120ToSq64[(sq120)]; }
export function SQ120(sq64) { return Sq64ToSq120[(sq64)]; }
export function SQOFFBOARD(sq) { return FilesBoard[sq] == SQUARES.OFFBOARD; }
export function PIECEINDEX(piece, pieceNum) { return (piece * 10 + pieceNum); }

export function FROMSQ(m) { return  (m & 0x7F); }
export function TOSQ(m) { return  ( (m >> 7) & 0x7F); }
export function CAPTURED(m) { return  ( (m >> 14) & 0xF); }
export function PROMOTED(m) { return  ( (m >> 20) & 0xF); }

export function RAND_32() {
    return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
         | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);
}


/* --- Constant Flags --- */
/*Flags to bitwise AND with*/
export var MFLAGEP = 0x40000;
export var MFLAGPS = 0x80000;
export var MFLAGCA = 0x1000000;

export var MFLAGCAP = 0x7C; /*returns a non zero number if there was a capture (including en passant)*/
export var MFLAGPROM = 0xF00000; /*these could be used instead of doing the whole shift*/