import { AttackValMultiplier, Color, Piece, Square } from "../shared/enums";
import { CaptureDir, GetOtherSide, GetSq64, IsBishopQueen, IsKing, IsKnight, IsPawn, IsRookQueen, IsSliding, PawnCaptureDir, PieceAttackVal, PieceColor, PieceDir, sqOffboard } from "../shared/utils";
import { IBoard } from "./iboard";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";

export interface IAttackTable {
    getAttacks(sq: Square, color: Color): number;
    /**
     * Updates table when sliding attacks are revealed by moving away from a square
     */
    updateFrom(piece: Piece, sq: Square): void;
    /**
     * Update table when sliding attacks are blocked by moving to a square
     */
    updateTo(piece: Piece, sq: Square): void;
}

export default class AttackTable implements IAttackTable {
    private board: IBoard;

    private whiteAttacks: number[];
    private blackAttacks: number[];

    constructor(board: IBoard) {
        this.board = board;
        this.whiteAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
        this.blackAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
    }

    public getAttacks(sq: Square, color: Color): number {
        return (color === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq]];
    }

    public updateFrom(piece: Piece, sq: Square): void {
        if (piece === Piece.none) return;

        // remove squares attack by piece at sq
        if (IsSliding[piece]) {
            if (IsBishopQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteBishop]) {
                    this.updateAttackRay(-PieceAttackVal[piece], PieceColor[piece], sq, dir, IsBishopQueen);
                }
            }
            if (IsRookQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteRook]) {
                    this.updateAttackRay(-PieceAttackVal[piece], PieceColor[piece], sq, dir, IsRookQueen);
                }
            }
        }
        else { // non-sliding pieces
            for (const dir of CaptureDir[piece]) {
                if (sqOffboard(sq + dir)) continue;
                (PieceColor[piece] === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq + dir]] -= PieceAttackVal[piece];
            }
        }

        // add revealed attacks
        for (const dir of PieceDir[Piece.whiteBishop]) {
            this.updateLineOfSight(piece, sq, dir, IsBishopQueen, AttackValMultiplier.add);
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            this.updateLineOfSight(piece, sq, dir, IsRookQueen, AttackValMultiplier.add);
        }
    }

    public updateTo(piece: Piece, sq: Square): void {
        if (piece === Piece.none) return;

        // add squares attacked by piece at sq
        if (IsSliding[piece]) {
            if (IsBishopQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteBishop]) {
                    this.updateAttackRay(PieceAttackVal[piece], PieceColor[piece], sq, dir, IsBishopQueen);
                }
            }
            if (IsRookQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteRook]) {
                    this.updateAttackRay(PieceAttackVal[piece], PieceColor[piece], sq, dir, IsRookQueen);
                }
            }
        }
        else { // non-sliding pieces
            for (const dir of CaptureDir[piece]) {
                if (sqOffboard(sq + dir)) continue;
                (PieceColor[piece] === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq + dir]] += PieceAttackVal[piece];
            }
        }

        // remove blocked attacks
        for (const dir of PieceDir[Piece.whiteBishop]) {
            this.updateLineOfSight(piece, sq, dir, IsBishopQueen, AttackValMultiplier.remove);
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            this.updateLineOfSight(piece, sq, dir, IsRookQueen, AttackValMultiplier.remove);
        }
    }

    private updateLineOfSight(originalPiece: Piece, sq: Square, dir: number, isTargetPiece: boolean[], multiplier: AttackValMultiplier): void {
        let totalMove = dir;
        while (true) {
            if (sqOffboard(sq + totalMove)) break;
            const piece = this.board.getPiece(sq + totalMove);
            let targetColor = Color.none;
            if (!isTargetPiece[originalPiece] && isTargetPiece[piece] && (targetColor === Color.none || PieceColor[piece] === targetColor)) {
                // piece of target piece type has line of sight to sq
                this.updateAttackRay(PieceAttackVal[piece] * multiplier, PieceColor[piece], sq, -dir, isTargetPiece);
                targetColor = PieceColor[piece];
            }
            if (piece !== Piece.none && !(PieceColor[piece] === targetColor && isTargetPiece[piece])) break;

            totalMove += dir;
        }
    }

    private updateAttackRay(increment: number, color: Color, sq: Square, dir: number, isTargetPiece: boolean[]): void {
        let totalMove = dir;
        while (true) {
            if (sqOffboard(sq + totalMove)) break;
            (color === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq + totalMove]] += increment;
            const piece = this.board.getPiece(sq + totalMove);
            if (piece !== Piece.none && !(PieceColor[piece] === color && isTargetPiece[piece])) break;
            totalMove += dir;
        }
    }
}

export class DummyAttackTable implements IAttackTable {
    private board: IBoard;

    constructor(board: IBoard) {
        this.board = board;
    }

    public getAttacks(sq: Square, color: Color): number {
        const defSide = GetOtherSide[color];
        if (color === Color.none) return 0;

        //Pawns
        for (const captureDir of PawnCaptureDir[defSide]) {
            const piece = this.board.getPiece(sq + captureDir);
            if (PieceColor[piece] === color && IsPawn[piece]) {
                return 1;
            }
        }

        // Kings and Knights
        for (const dir of PieceDir[Piece.whiteKing]) {
            if (sqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === color && IsKing[piece]) return 1;
        }
        for (const dir of PieceDir[Piece.whiteKnight]) {
            if (sqOffboard(sq + dir)) continue;
            const piece = this.board.getPiece(sq + dir);
            if (PieceColor[piece] === color && IsKnight[piece]) return 1;
        }

        // Bishops, Rooks, and Queens
        for (const dir of PieceDir[Piece.whiteBishop]) {
            let totalMove = dir;
            while (true) {
                const piece = this.board.getPiece(sq + totalMove);
                const colorAtSq = PieceColor[piece];
                if (sqOffboard(sq + totalMove) || colorAtSq === defSide) break;
                if (colorAtSq === color) {
                    if (IsBishopQueen[piece]) return 1;
                    break;
                }
                totalMove += dir;
            }
        }
        for (const dir of PieceDir[Piece.whiteRook]) {
            let totalMove = dir;
            while (true) {
                const piece = this.board.getPiece(sq + totalMove);
                const colorAtSq = PieceColor[piece];
                if (sqOffboard(sq + totalMove) || colorAtSq === defSide) break;
                if (colorAtSq === color) {
                    if (IsRookQueen[piece]) return 1;
                    break;
                }
                totalMove += dir;
            }
        }

        return 0;
    }

    public updateFrom(piece: Piece, sq: Square): void {}
    public updateTo(piece: Piece, sq: Square): void {}
}