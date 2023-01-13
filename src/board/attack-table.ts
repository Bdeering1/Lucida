import { AttackValMultiplier, Color, Piece, Square } from "../shared/enums";
import { GetSq64, IsBishopQueen, IsRookQueen, PieceAttackVal, PieceColor, PieceDir, sqOffboard } from "../shared/utils";
import { IBoard } from "./iboard";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";

export interface IAttackTable {
    getAttacks(color: Color, sq: Square): number;
    init(): void;
    /**
     * Updates table when sliding attacks are revealed by moving away from a square
     */
    updateFrom(sq: Square): void;
    /**
     * Update table when sliding attacks are blocked by moving to a square
     */
    updateTo(sq: Square): void;
}

export default class AttackTable {
    private board: IBoard;

    private whiteAttacks: number[];
    private blackAttacks: number[];

    constructor(board: IBoard) {
        this.board = board;
        this.whiteAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
        this.blackAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
    }

    public getAttacks(color: Color, sq: Square): number {
        return (color === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq]];
    }

    public init(): void {

    }

    public updateFrom(sq: Square): void {
        // remove squares attack by piece at sq
        const piece = this.board.getPiece(sq);
        if (IsBishopQueen[piece]) {
            for (const dir of PieceDir[Piece.whiteBishop]) {
                this.updateRay(sq, dir, IsRookQueen, AttackValMultiplier.remove);
            }
        }
        if (IsRookQueen[piece]) {
            for (const dir of PieceDir[Piece.whiteRook]) {
                this.updateRay(sq, dir, IsRookQueen, AttackValMultiplier.remove);
            }
        }
        else { // non-sliding pieces
            for (const dir of PieceDir[piece]) {
                if (sqOffboard(sq + dir)) continue;
                (PieceColor[piece] === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq + dir]] -= PieceAttackVal[piece];
            }
        }

        // add revealed attacks
        for (const dir of PieceDir[Piece.whiteBishop]) {
            this.updateRay(sq, dir, IsRookQueen, AttackValMultiplier.add);
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            this.updateRay(sq, dir, IsRookQueen, AttackValMultiplier.add);
        }
    }

    public updateTo(sq: Square): void {
        // add squares attacked by piece at sq
        const piece = this.board.getPiece(sq);
        if (IsBishopQueen[piece]) {
            for (const dir of PieceDir[Piece.whiteBishop]) {
                this.updateRay(sq, dir, IsBishopQueen, AttackValMultiplier.add);
            }
        }
        if (IsRookQueen[piece]) {
            for (const dir of PieceDir[Piece.whiteRook]) {
                this.updateRay(sq, dir, IsRookQueen, AttackValMultiplier.add);
            }
        }
        else { // non-sliding pieces
            for (const dir of PieceDir[piece]) {
                if (sqOffboard(sq + dir)) continue;
                (PieceColor[piece] === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq + dir]] -= PieceAttackVal[piece];
            }
        }

        // remove blocked attacks
        for (const dir of PieceDir[Piece.whiteBishop]) {
            this.updateRay(sq, dir, IsBishopQueen, AttackValMultiplier.remove);
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            this.updateRay(sq, dir, IsRookQueen, AttackValMultiplier.remove);
        }
    }

    private updateRay(sq: Square, dir: number, isTargetPiece: boolean[], multiplier: AttackValMultiplier): void {
        let totalMove = dir;
        while (true) {
            if (sqOffboard(sq + totalMove)) break;
            const piece = this.board.getPiece(sq + totalMove);
            if (piece !== Piece.none) {
                if (isTargetPiece[piece]) { // piece of target piece type has line of sight to sq
                    this.updateSlidingAttacks(PieceAttackVal[piece] * multiplier, PieceColor[piece], sq, -dir);
                }
                break;
            }

            totalMove += dir;
        }
    }

    private updateSlidingAttacks(increment: number, color: Color, sq: Square, dir: number): void {
        let totalMove = dir;
        while (true) {
            if (sqOffboard(sq + totalMove)) break;
            (color === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq + totalMove]] += increment;
            if (this.board.getPiece(sq + totalMove) !== Piece.none) break;
            totalMove += dir;
        }
    }
}