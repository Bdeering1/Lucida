const PIECES = { EMPTY : 0, wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6, bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12 };

const BRD_SQ_NUM = 120;

const FILES = { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
const RANKS = { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, FILE_NONE:8 };

const COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

const CASTLEBIT = { WKCA:1, WQCA:2, BKCA:4, BQCA:8 };

const SQUARES = {
    A1:91, B1:92, C1:93, D1:94, E1:95, F1:96, G1:97, H1:98,
    A8:21, B8:22, C8:23, D8:24, E8:25, F8:26, G8:27, H8:28,
    NO_SQ:99, OFFBOARD:100
};

const MAXGAMEMOVES = 2048; /*(half moves)*/
const MAXPOSITIONMOVES = 256; /*used for storing moves in GameBoard.moveList for engine calculation*/
const MAXDEPTH = 64;

var FilesBoard = new Array(BRD_SQ_NUM);
var RanksBoard = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/*For Easy Printing*/
var PieceChar = ".PNBRQKpnbrqk"; /*changed from PceChar*/
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";

function FR2SQ(f,r) { /*file rank to square*/
    return ( 21 + (f) ) + ( 70 - ((r) * 10) );
}

var PieceBig = [ false, false, true, true, true, true, true, false, true, true, true, true, true ];
var PieceMaj = [ false, false, false, false, true, true, true, false, false, false, true, true, true ];
var PieceMin = [ false, false, true, true, false, false, false, false, true, true, false, false, false ];
var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
var PiecePawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ]; /*not used so far, needed?*/
var PieceKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ]; /*not used either*/
var PieceKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ]; /*not used either*/
var PieceRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
var PieceBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];
var PieceSlides = [ false, false, false, true, true, true, false, false, false, true, true, true, false ];

var NDir = [ -8, -19, -21, -12, 8, 19, 21, 12 ];
var RDir = [ -1, -10, 1, 10 ];
var BDir = [ -9, -11, 11, 9 ];
var KDir = [ -1, -10, 1, 10, -9, -11, 11, 9 ];

var DirNum = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
var PceDir = [ 0, 0, NDir, BDir, RDir, KDir, KDir, 0, NDir, BDir, RDir, KDir, KDir ];
var LoopNonSlidePce = [ PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0 ];
var LoopNonSlideIndex = [ 0, 3 ];

var LoopSlidePce = [ PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
var LoopSlideIndex = [ 0, 4];

/* Piece * 120 + square (gives 120 space for each piece type and with the square number added on top ensures the key is unique) */
var PieceKeys = new Array(13 * 120);
var SideKey;
var CastleKeys = new Array(16);

var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64); /*populated in main*/

function RAND_32() {
    return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16) |
            (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);
}

function SQ64(sq120) {
    return Sq120ToSq64[(sq120)];
}

function SQ120(sq64) {
    return Sq64ToSq120[(sq64)];
}

function PIECEINDEX(piece, pieceNum) {
    return (piece * 10 + pieceNum);
}

var Kings = [PIECES.wK, PIECES.bK];

var CastlePerm = [
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

function FROMSQ(m) { return  (m & 0x7F); } /*m = move*/
function TOSQ(m) { return  ( (m >> 7) & 0x7F); }
function CAPTURED(m) { return  ( (m >> 14) & 0xF); }
function PROMOTED(m) { return  ( (m >> 20) & 0xF); }

/*Flags to bitwise AND with*/
var MFLAGEP = 0x40000;
var MFLAGPS = 0x80000;
var MFLAGCA = 0x1000000;

var MFLAGCAP = 0x7C; /*returns a non zero number if there was a capture (inlcudes en passant)*/
var MFLAGPROM = 0xF00000; /*these could be used instead of doing the whole shift*/

var NOMOVE = 0;

function SQOFFBOARD(sq) {
    if (FilesBoard[sq] == SQUARES.OFFBOARD) return true;
    return false;
}

function HASH_PIECE(pceType, sq) { GameBoard.posKey ^= PieceKeys[(pceType * 120) + sq]; }
function HASH_CA() { GameBoard.posKey ^= CastleKeys[GameBoard.castlePerm]; } /*we should either hash out the existing key first or just get the CASTLEBIT*/
function HASH_SIDE() { GameBoard.posKey ^= SideKey; }
function HASH_EP() { GameBoard.posKey ^= PieceKeys[GameBoard.enPas]; }


var def_success = 1;