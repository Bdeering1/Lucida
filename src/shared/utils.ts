/* eslint-disable no-magic-numbers */

import { Colour, Piece, Square } from './enums';
import { BOARD_SQ_NUM } from './constants.js';

export default class BoardUtils {
    /* --- Empty Maps --- */
    static FilesBoard = new Array(BOARD_SQ_NUM);
    static RanksBoard = new Array(BOARD_SQ_NUM);
    /* Piece * 120 + square (gives 120 space for each piece type and with the square number added on top ensures the key is unique) */
    static PieceKeys = new Array(13 * 120);
    static SideKey = this.Rand32(); /* hashed in if white is to move*/
    static CastleKeys = new Array(16);
    static Sq120ToSq64 = new Array(BOARD_SQ_NUM);
    static Sq64ToSq120 = new Array(64);

    GetSquare(file : number, rank : number) {
        return 21 + file + (70 - rank * 10);
    }
    Sq64(sq120 : number) {
        return BoardUtils.Sq120ToSq64[sq120];
    }
    Sq120(sq64 : number) {
        return BoardUtils.Sq64ToSq120[sq64];
    }
    SqOffboard(sq : number) {
        return BoardUtils.FilesBoard[sq] === Square.offBoard;
    }
    PieceIndex(piece : number, pieceNum : number) {
        return piece * 10 + pieceNum;
    }

    FromSq(m : number) {
        return m & 0x7F;
    }
    ToSq(m : number) {
        return m >> 7 & 0x7F;
    }
    Captured(m : number) {
        return m >> 14 & 0xF;
    }
    Promoted(m : number) {
        return m >> 20 & 0xF;
    }

    static Rand32() {
        return Math.floor(Math.random() * 255 + 1) << 23 | Math.floor(Math.random() * 255 + 1) << 16
        | Math.floor(Math.random() * 255 + 1) << 8 | Math.floor(Math.random() * 255 + 1);
    }
}