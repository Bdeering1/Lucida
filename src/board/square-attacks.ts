/* eslint-disable no-magic-numbers */
import { SQ64_SIZE_BYTES } from "../shared/constants";
import { Piece, Square } from "../shared/enums";
import { GetSq64 } from "../shared/utils";

const BUCKET_OFFSET = [0, 12, 30, 42, 54];
const BUCKET_SIZE =   [2,  3,  2,  2, 1];
const BUCKET_OFFSET_PIECE = [0, 0, 12, 12, 30, 42, 54, 0, 12, 12, 30, 42, 54];
const BUCKET_SIZE_PIECE =   [0, 2,  3,  3,  2,  2,  1, 2,  3,  3,  2,  2,  1];

export default class SquareAttacks  {
    private value = 0;

    constructor(to64: number) {
        let offset = 0;
        while (offset + SQ64_SIZE_BYTES < 64) {
            this.value |= to64 << offset;
            if (to64 === GetSq64[Square.e2]) {
                console.log(this.value.toString(2));
                console.log((this.value >> offset) & 0x3F);
            }
            offset += SQ64_SIZE_BYTES;
        }
    }

    public update(piece: Piece, from64: Square, to64: Square, multiplier: number) {
        const bucketOffset = BUCKET_OFFSET_PIECE[piece];
        const bucketSize = BUCKET_SIZE_PIECE[piece];
        if (multiplier === 1) { // adding to bucket
            for (let i = 0; i < bucketSize; i++) {    
                if (((this.value >> (bucketOffset + i * SQ64_SIZE_BYTES)) & 0x3F) === to64) {
                    this.value |= (from64 >> (bucketOffset + i * SQ64_SIZE_BYTES));
                    break;
                }
            }
            return;
        }
        // (else) removing from bucket
        for (let i = 0; i < bucketSize; i++) {    
            if (((this.value >> (bucketOffset + i * SQ64_SIZE_BYTES)) & 0x3F) === from64) {
                // swap with last in bucket and delete last
                const lastPieceSq = ((this.value >> (bucketOffset + (bucketSize - 1) * SQ64_SIZE_BYTES)) & 0x3F);
                this.value |= (lastPieceSq >> (bucketOffset + i * SQ64_SIZE_BYTES));
                this.value |= (to64 >> (bucketOffset + (bucketSize - 1) * SQ64_SIZE_BYTES));
                break;
            }
        }
    }

    public *getSmallestAttacker(to64: Square): IterableIterator<Square> {
        for (let bucketIdx = 0; bucketIdx < BUCKET_OFFSET.length; bucketIdx++) { // for each bucket (piece value tier)
            for (let bucket = 0; bucket < BUCKET_SIZE[bucketIdx]; bucket++) { // yield each piece in bucket (square that the piece is on)
                const pieceSq = ((this.value >> (BUCKET_OFFSET[bucketIdx] + bucket * SQ64_SIZE_BYTES)) & 0x3F);
                if (pieceSq === to64) break;
                yield pieceSq;
            }
        }
    }
}

/**
 * Piece -> piece bucket (value 0-4)
 * map[p] -> fP
 * 
 * pawn = 0 (0)
 * knight = 1 (12)
 * bishop = 1 (12)
 * rook = 2 (30)
 * queen = 3 (42)
 * king = 4 (54)
 * 
 * 000000 000000 000000 000000 000000 000000 000000 000000 000000 000000 0000
 * ^pawn         ^minor               ^rook         ^queen        ^king  ^leftover bits
 * 0             12                   30            42            54
 * 
 * each bucket represents a tier of piece value
 * 
 * since each square is represented by 6 bits (6 bits = 64 options = 64 squares), unused squares (no attacker) are represented by
 * the value of the square being attacked itself ("to" square)
 */