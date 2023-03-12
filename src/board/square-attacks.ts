/* eslint-disable no-magic-numbers */
import { Piece, Square } from "../shared/enums";

const SQ64_SIZE_BITS = 6;
const BIT_MASK_6 = 0x3F;
const BIT_MASK_32 = 0xFFFFFFFF;

const BUCKET_DWORD = [0, 0, 1, 1, 1];
const BUCKET_OFFSET = [0, 12, 0, 12, 24];
const BUCKET_SIZE =   [2,  3,  2,  2, 1];
const BUCKET_DWORD_PIECE = [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1];
const BUCKET_OFFSET_PIECE = [0, 0, 12, 12, 0, 12, 24, 0, 12, 12, 0, 12, 24];
const BUCKET_SIZE_PIECE =   [0, 2,  3,  3, 2,  2,  1, 2,  3,  3, 2,  2,  1];

export default class SquareAttacks  {
    private value = [0, 0];
    private sum = 0;

    constructor(to64: number) {
        let offset = 0;
        while (offset + SQ64_SIZE_BITS < 32) {
            this.value[0] |= to64 << offset;
            this.value[1] |= to64 << offset;
            offset += SQ64_SIZE_BITS;
        }
    }

    public isAttacked(): boolean {
        return this.sum !== 0;
    }

    public update(piece: Piece, from64: Square, to64: Square, multiplier: number) {
        const dWord = BUCKET_DWORD_PIECE[piece];
        const bucketOffset = BUCKET_OFFSET_PIECE[piece];
        const bucketSize = BUCKET_SIZE_PIECE[piece];
        if (multiplier === 1) { // adding to bucket
            this.sum++;
            for (let i = 0; i < bucketSize; i++) {    
                if (((this.value[dWord] >> (bucketOffset + i * SQ64_SIZE_BITS)) & BIT_MASK_6) === to64) {
                    this.value[dWord] &= (BIT_MASK_6 << (bucketOffset + i * SQ64_SIZE_BITS)) ^ BIT_MASK_32;
                    this.value[dWord] |= (from64 << (bucketOffset + i * SQ64_SIZE_BITS));
                    break;
                }
            }
            return;
        }
        // (else) removing from bucket
        this.sum--;
        for (let i = 0; i < bucketSize; i++) {    
            if (((this.value[dWord] >> (bucketOffset + i * SQ64_SIZE_BITS)) & BIT_MASK_6) === from64) {
                const lastPieceSq = ((this.value[dWord] >> (bucketOffset + (bucketSize - 1) * SQ64_SIZE_BITS)) & BIT_MASK_6);
                this.value[dWord] &= (BIT_MASK_6 << (bucketOffset + i * SQ64_SIZE_BITS)) ^ BIT_MASK_32;
                this.value[dWord] |= (lastPieceSq << (bucketOffset + i * SQ64_SIZE_BITS)); // set to last in bucket

                this.value[dWord] &= (BIT_MASK_6 << (bucketOffset + (bucketSize - 1) * SQ64_SIZE_BITS)) ^ BIT_MASK_32;
                this.value[dWord] |= (to64 << (bucketOffset + (bucketSize - 1) * SQ64_SIZE_BITS)); // delete last
                break;
            }
        }
    }

    public * getSmallestAttacker(to64: Square): IterableIterator<Square> {
        for (let bucketIdx = 0; bucketIdx < BUCKET_OFFSET.length; bucketIdx++) { // for each bucket (piece value tier)
            for (let bucket = 0; bucket < BUCKET_SIZE[bucketIdx]; bucket++) { // yield each piece in bucket (square that the piece is on)
                const pieceSq = ((this.value[BUCKET_DWORD[bucketIdx]] >> (BUCKET_OFFSET[bucketIdx] + bucket * SQ64_SIZE_BITS)) & BIT_MASK_6);
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
 * dword 1                                dword 2
 * 000000 000000 000000 000000 000000 00  000000 000000 000000 000000 000000 00
 * ^pawn         ^minor                   ^rook         ^queen        ^king  ^leftover bits
 * 0             12                       0             12            24 
 * 
 * each bucket represents a tier of piece value
 * 
 * since each square is represented by 6 bits (6 bits = 64 options = 64 squares), unused squares (no attacker) are represented by
 * the value of the square being attacked itself ("to" square)
 */