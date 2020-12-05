const PIECES = { EMPTY : 0, wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6, bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12 };

const BRD_SQ_NUM = 120;

const FILES = { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
const RANKS = { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, FILE_NONE:8 };

const COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

const CASTLEBIT = { WKCA:1, WQCA:2, BKCA:4, BQCA:8 };

const SQUARES = {
    A1:21, B1:22, C1:23, D1:24, E1:25, F1:26, G1:27, H1:28,
    A8:91, B8:92, C8:93, D8:94, E8:95, F8:96, G8:97, H8:98,
    NO_SQ:99, OFFBOARD:100
};

const MAXGAMEMOVES = 2048; /*(half moves)*/
const MAXPOSITIONMOVES = 256; /*used for storing moves in an array for engine calculation*/
const MAXDEPTH = 64;

/*Init32 faster??*/
var FilesBoard = new Array(BRD_SQ_NUM);
var RanksBoard = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/*For Easy Printing*/
var PieceChar = ".PNBRQKpnbrqk"; /*changed from PceChar*/
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";

function FR2SQ(f,r) { /*file rank to square*/
    return ( 21 + (f) ) + ( 70 - ((r) * 10) ); /*********JUST CHANGED, MAY NOT BE CORRECT************* (yep it breaks SqAttacked somehow)*/
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
var PieceKeys = new Array(13 * 120); /*used to be 14 for some reason*/
var SideKey; /*which side is to move*/
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

function FROMSQ(m) { return  (m & 0x7F); } /*m = move*/
function TOSQ(m) { return  ( (m >> 7) & 0x7F); }
function CAPTURED(m) { return  ( (m >> 14) & 0xF); }
function PROMOTED(m) { return  ( (m >> 20) & 0xF); }

/*Flags to bitwise and with*/
var MFLAGEP = 0x40000;
var MFLAGPS = 0x80000;
var MFLAGCA = 0x1000000;

var MFLAGCAP = 0x7C; /*returns a non zero number if there was a capture (inlcudes en passant)*/
var MFLAGPROM = 0xF00000; /*why aren't these just used instead of doing the whole shift??*/

var NOMOVE = 0;

function SQOFFBOARD(sq) {
    if (FilesBoard[sq] == SQUARES.OFFBOARD) return true;
    return false;
}

/*Adding padEnd() to js if not found*/
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
}

console.log("defs.js success");