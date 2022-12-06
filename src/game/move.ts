import { Piece, Square } from "../shared/enums";
import { PIECE_CHAR } from "../shared/constants";
import { getSquareString } from "../cli/printing";

export default class Move {
    public from: Square;
    public to: Square;
    public capture = false;
    public promotion: Piece = Piece.none;

    public constructor(from: Square, to: Square) {
        this.from = from;
        this.to = to;
    }

    public setCapture(): Move {
        this.capture = true;
        return this;
    }

    public setPromotion(promotion: Piece): Move {
        this.promotion = promotion;
        return this;
    }
    public toString(): string {
        return `${getSquareString(this.from)}${getSquareString(this.to)}${this.promotion ? PIECE_CHAR[this.promotion] : ""}`;
    }

    public equals(other: Move): boolean {
        return this.from === other.from && this.to === other.to && this.promotion === other.promotion;
    }
}
