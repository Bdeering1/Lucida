import { Piece, Square } from "../shared/enums";
import { PIECE_CHAR } from "../shared/constants";
import { getSquareString } from "../cli/printing";

export default class Move {
    public from: Square;
    public to: Square;
    public capture: Piece;
    public promotion: Piece;

    public constructor(from: Square, to: Square, capture = Piece.none, promotion = Piece.none) {
        this.from = from;
        this.to = to;
        this.capture = capture;
        this.promotion = promotion;
    }
    
    public toString(): string {
        return `${getSquareString(this.from)}${getSquareString(this.to)}${this.promotion ? PIECE_CHAR[this.promotion] : ''}`;
    }

    public equals(other: Move): boolean {
        return this.from === other.from && this.to === other.to && this.promotion === other.promotion;
    }
}
