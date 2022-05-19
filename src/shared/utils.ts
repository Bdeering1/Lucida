import { BRD_SQ_NUM } from "./constants";
import { SQUARES, COLOURS, PIECES } from "./enums";

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