import { Piece, Square } from "../shared/enums";
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

    public static noMove(): Move {
        return new Move(Square.none, Square.none);
    }

    public isNoMove(): boolean {
        return this.from === Square.none;
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
        return `${getSquareString(this.from)}${getSquareString(this.to)}`;
    }
}
