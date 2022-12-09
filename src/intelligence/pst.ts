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
const MGPawnTable64 = [
      0,   0,   0,   0,   0,   0,   0,   0,
     20,  30,  32,  35,  35,  32,  30,  20,
     -5,  10,  12,  15,  15,  12,  10,  -5,
    -10,   5,   7,  10,  10,   7,   5, -10,
    -15,   0,   2,   5,   5,   2,   0, -15,
    -15,   0,   0,   0,   0,   0,   0, -15,
    -20,  -5,  -5, -15, -15,  15,  15, -20,
      0,   0,   0,   0,   0,   0,   0,   0,
];

/**
 * 10 for being on the 6th rank
 * 5 for being on the 5th, or 7th rank
 * 5 for being in the center 16 squares
 * -5 for being 1 square from an edge
 * -10 for being on an edge
 */
const MGKnightTable64 = [
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
const MGBishopTable64 = [
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
const MGRookTable64 = [
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
const MGQueenTable64 = [
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
const MGKingTable64 = [
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
    static middleGame: number[][];
    static endGame: number[][];

    static init() {
        this.middleGame = [
            [],
            this.createTable120White(MGPawnTable64),
            this.createTable120White(MGKnightTable64),
            this.createTable120White(MGBishopTable64),
            this.createTable120White(MGRookTable64),
            this.createTable120White(MGQueenTable64),
            this.createTable120White(MGKingTable64),
            this.createTable120Black(MGPawnTable64),
            this.createTable120Black(MGKnightTable64),
            this.createTable120Black(MGBishopTable64),
            this.createTable120Black(MGRookTable64),
            this.createTable120Black(MGQueenTable64),
            this.createTable120Black(MGKingTable64),
        ];

        this.endGame = [
            [],
            this.createTable120White(MGPawnTable64),
            this.createTable120White(MGKnightTable64),
            this.createTable120White(MGBishopTable64),
            this.createTable120White(MGRookTable64),
            this.createTable120White(MGQueenTable64),
            this.createTable120White(MGKingTable64),
            this.createTable120Black(MGPawnTable64),
            this.createTable120Black(MGKnightTable64),
            this.createTable120Black(MGBishopTable64),
            this.createTable120Black(MGRookTable64),
            this.createTable120Black(MGQueenTable64),
            this.createTable120Black(MGKingTable64),
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