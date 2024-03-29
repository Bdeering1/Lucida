/* eslint-disable no-magic-numbers */
import { Piece, Square } from "../shared/enums";
import { PIECE_CHAR } from "../shared/constants";
import { getSquareString } from "../cli/printing";

export default class Move {
    private value: number;

    public get from(): Square { return this.value & 0x7F; }
    public get to(): Square { return (this.value >> 7) & 0x7F; }
    public get capture(): Piece { return (this.value >> 14) & 0xF; }
    public get promotion(): Piece { return (this.value >> 18) & 0xF; }

    public set promotion(piece: Piece) {
        this.value |= piece << 18;
    }

    public constructor(from: Square, to: Square, capture = Piece.none, promotion = Piece.none) {
        this.value = from | (to << 7) | (capture << 14) | (promotion << 18);
    }

    public static noMove(): Move {
        return new Move(Square.none, Square.none);
    }

    public isNoMove(): boolean {
        return this.value === 0;
    }

    public toString(): string {
        return `${getSquareString(this.from)}${getSquareString(this.to)}${this.promotion ? PIECE_CHAR[this.promotion] : ''}`;
    }

    public equals(other: Move): boolean {
        return (this.value & 0x3C3FFF) === (other.value & 0x3C3FFF); // ignore capture
    }
}