/* eslint-disable no-magic-numbers, indent */

import { BOARD_SQ_NUM, INNER_BOARD_SQ_NUM } from "../shared/constants";
import { GetSq120 } from "../shared/utils";
import { Rank } from "../shared/enums";

/* --- Piece Square Tables --- */

/**
 * 30 for being on the 7th rank
 * 20 for being on f2 or g2
 * 10 for being on the 6th rank
 * 5 for being on the 5th rank
 * 5 for being on files d or e and ranks 4 or greater
 * 2 for being on files c or f and ranks 4 or greater
 * -5 for being on the 2nd rank
 * -15 for being on an outside file
 */
const PawnTable64 = [
      0,   0,   0,   0,   0,   0,   0,   0,
     20,  30,  32,  35,  35,  32,  30,  20,
     -5,  10,  12,  15,  15,  12,  10,  -5,
    -10,   5,   7,  10,  10,   7,   5, -10,
    -15,   0,   2,   5,   5,   2,   0, -15,
    -15,   0,   0,   0,   0,   0,   0, -15,
    -20,  -5,  -5, -15, -15,  20,  20, -20,
      0,   0,   0,   0,   0,   0,   0,   0,
];

/**
 * 10 for being on the 6th rank
 * 5 for being on the 5th, or 7th rank
 * 5 for being in the center 16 squares
 * -5 for being 1 square from an edge
 * -10 for being on an edge
 */
const KnightTable64 = [
    -20, -15, -10, -10, -10, -10, -15, -20,
    -10,  -5,   0,   0,   0,   0,  -5, -10,
      0,   5,  15,  15,  15,  15,   5,   0,
     -5,   0,  10,  10,  10,  10,   0,  -5,
    -10,  -5,   5,   5,   5,   5,  -5, -10,
    -10,  -5,   5,   5,   5,   5,  -5, -10,
    -15, -10,  -5,  -5,  -5,  -5, -10, -15,
    -20, -15, -10, -10, -10, -10, -15, -20,
];

/**
 * 10 for being on an 8 long diagonal
 * 5 for being on a 7 long diagonal
 * 2 for being on a 6 long diagonal
 * -5 for being on an edge
 */
const BishopTable64 = [
      0,   0,  -3,  -5,  -5,  -3,   0,   0,
      0,  10,   5,   2,   2,   5,  10,   0,
     -3,   5,  10,   7,   7,  10,   5,  -3,
     -5,   2,   7,  15,  15,   7,   2,  -5,
     -5,   2,   7,  15,  15,   7,   2,  -5,
     -3,   5,  10,   7,   7,  10,   5,  -3,
      0,  10,   5,   2,   2,   5,  10,   0,
      0,   0,  -3,  -5,  -5,  -3,   0,   0,
];

/**
 * 15 for being on the 7th rank
 * 5 for being on the 8th rank
 * 5 for being on files d or e
 * 10 for being on d1 or e1
 * 5 for being on c1, d2, e2, or f1
 */
const RookTable64 = [
     5,  5,  5, 10, 10,  5,  5,  5,
    15, 15, 15, 20, 20, 15, 15, 15,
     0,  0,  0,  5,  5,  0,  0,  0,
     0,  0,  0,  5,  5,  0,  0,  0,
     0,  0,  0,  5,  5,  0,  0,  0,
     0,  0,  0,  5,  5,  0,  0,  0,
     0,  0,  0, 10, 10,  0,  0,  0,
     0,  0,  5, 15, 15,  5,  0,  0,
];

/**
 * 10 for being on ranks 6, 7, or 8 and on the right half of the board
 * 2 for being on ranks 6, 7, or 8
 * -2 for being on files 1 or 8
 * -5 for being on rank 1
 */
const QueenTable64 = [
      0,   2,   2,   2,  12,  12,  12,  10,
      0,   2,   2,   2,  12,  12,  12,  10,
      0,   2,   2,   2,  12,  12,  12,  10,
     -2,   0,   0,   0,   0,   0,   0,  -2,
     -2,   0,   0,   0,   0,   0,   0,  -2,
     -2,   0,   0,   0,   0,   0,   0,  -2,
     -2,   0,   0,   0,   0,   0,   0,  -2,
     -7,  -5,  -5,  -5,  -5,  -5,  -5,  -5,
];

/**
 * -2 for being on file d or e
 * -2 for being on ranks 4 or 5
 */
const KingTable64 = [
      0,   0,   0,  -2,  -2,   0,   0,   0,
      0,   0,   0,  -2,  -2,   0,   0,   0,
      0,   0,   0,  -2,  -2,   0,   0,   0,
     -2,  -2,  -2,  -4,  -4,  -2,  -2,  -2,
     -2,  -2,  -2,  -4,  -4,  -2,  -2,  -2,
      0,   0,   0,  -2,  -2,   0,   0,   0,
      0,   0,   0,  -2,  -2,   0,   0,   0,
      0,   0,   0,  -2,  -2,   0,   0,   0,
];

export default class PieceSquareTables {
    static whitePawn: number[];
    static whiteKnight: number[];
    static whiteBishop: number[];
    static whiteRook: number[];
    static whiteQueen: number[];
    static whiteKing: number[];

    static blackPawn: number[];
    static blackKnight: number[];
    static blackBishop: number[];
    static blackRook: number[];
    static blackQueen: number[];
    static blackKing: number[];

    static map: number[][];

    static init() {
        this.whitePawn = this.createTable120White(PawnTable64);
        this.whiteKnight = this.createTable120White(KnightTable64);
        this.whiteBishop = this.createTable120White(BishopTable64);
        this.whiteRook = this.createTable120White(RookTable64);
        this.whiteQueen = this.createTable120White(QueenTable64);
        this.whiteKing = this.createTable120White(KingTable64);

        this.blackPawn = this.createTable120Black(PawnTable64);
        this.blackKnight = this.createTable120Black(KnightTable64);
        this.blackBishop = this.createTable120Black(BishopTable64);
        this.blackRook = this.createTable120Black(RookTable64);
        this.blackQueen = this.createTable120Black(QueenTable64);
        this.blackKing = this.createTable120Black(KingTable64);

        this.map = [
            [],
            PieceSquareTables.whitePawn,
            PieceSquareTables.whiteKnight,
            PieceSquareTables.whiteBishop,
            PieceSquareTables.whiteRook,
            PieceSquareTables.whiteQueen,
            PieceSquareTables.whiteKing,
            PieceSquareTables.blackPawn,
            PieceSquareTables.blackKnight,
            PieceSquareTables.blackBishop,
            PieceSquareTables.blackRook,
            PieceSquareTables.blackQueen,
            PieceSquareTables.blackKing,
        ];
    }

    private static createTable120White(table64: number[]): number[] {
        const table120 = new Array(120);

        table120.fill(0);
        let rank = Rank.one;
        for (let sq = 0; sq < INNER_BOARD_SQ_NUM; sq++) {
            table120[GetSq120[(64 - rank * 8) + (sq % 8)]] = table64[sq];
            if ((sq + 1) % 8 === 0) rank++;
        }
        return table120;
    }

    private static createTable120Black(table64: number[]): number[] {
        const table120 = new Array(BOARD_SQ_NUM);

        table120.fill(0);
        for (let sq = 0; sq < INNER_BOARD_SQ_NUM; sq++) {
            table120[GetSq120[sq]] = table64[sq];
        }
        return table120;
    }
}