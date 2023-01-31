import { AttackValMultiplier, Color, File, FileStatus, Piece, Square } from "../shared/enums";
import { CaptureDir, GetFile, GetOtherSide, GetRank, GetSq64, IsBishopQueen, IsKing, IsKnight, IsPawn, IsRookQueen, IsSliding, Kings, PawnCaptureDir, PieceAttackVal, PieceColor, PieceDir, RankToBits, RankToBitsInverse, sqOffboard } from "../shared/utils";
import { INNER_BOARD_SQ_NUM, NUM_FILE_TYPES } from "../shared/constants";
import { IBoard } from "./iboard";
import { getColorString } from "../cli/printing";

export interface IAttackTable {
    getAttacks(sq: Square, color: Color): number;
    getCoverage(color: Color): number;
    isOpen(file: File, color: Color): FileStatus;
    inCheck(color: Color): boolean;
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
    private whitePawnFiles: number[];
    private blackPawnFiles: number[];

    public attackSums: number[];

    constructor(board: IBoard) {
        this.board = board;
        this.whiteAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
        this.blackAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
        this.whitePawnFiles = new Array(NUM_FILE_TYPES).fill(0);
        this.blackPawnFiles = new Array(NUM_FILE_TYPES).fill(0);

        this.attackSums = [0, 0];
    }

    public getAttacks(sq: Square, color: Color): number {
        return (color === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq]];
    }

    public getCoverage(color: Color) {
        return this.attackSums[color];
    }

    public isOpen(file: File, color: Color): FileStatus {
        let fileStatus = FileStatus.closed;
        if (color === Color.white) {
            if (this.whitePawnFiles[file] === 0) fileStatus += FileStatus.thisOpen;
            if (this.blackPawnFiles[file] === 0) fileStatus += FileStatus.otherOpen;
        }
        else {
            if (this.whitePawnFiles[file] === 0) fileStatus += FileStatus.otherOpen;
            if (this.blackPawnFiles[file] === 0) fileStatus += FileStatus.thisOpen;
        }
        return fileStatus;
    }

    public inCheck(color: Color): boolean {
        const kingSq = this.board.getSquares(Kings[color]).next().value;
        if (kingSq === undefined) throw new Error(`${getColorString(color)} king not found`);
        return this.board.attackTable.getAttacks(kingSq, GetOtherSide[color]) !== 0;
    }

    public updateFrom(piece: Piece, sq: Square): void {
        if (piece === Piece.none) return;

        // remove squares attack by piece at sq
        if (IsSliding[piece]) {
            if (IsBishopQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteBishop]) {
                    this.updateAttackRay(piece, sq, dir, IsBishopQueen, AttackValMultiplier.remove);
                }
            }
            if (IsRookQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteRook]) {
                    this.updateAttackRay(piece, sq, dir, IsRookQueen, AttackValMultiplier.remove);
                }
            }
        }
        else { // non-sliding pieces
            for (const dir of CaptureDir[piece]) {
                if (sqOffboard(sq + dir)) continue;
                this.updateAttack(piece, sq + dir, AttackValMultiplier.remove);
            }
            if (IsPawn[piece]) {
                (piece === Piece.whitePawn ? this.whitePawnFiles : this.blackPawnFiles)[GetFile[sq]] &= RankToBitsInverse[GetRank[sq]];
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
                    this.updateAttackRay(piece, sq, dir, IsBishopQueen, AttackValMultiplier.add);
                }
            }
            if (IsRookQueen[piece]) {
                for (const dir of PieceDir[Piece.whiteRook]) {
                    this.updateAttackRay(piece, sq, dir, IsRookQueen, AttackValMultiplier.add);
                }
            }
        }
        else { // non-sliding pieces
            for (const dir of CaptureDir[piece]) {
                if (sqOffboard(sq + dir)) continue;
                this.updateAttack(piece, sq + dir, AttackValMultiplier.add);
            }
            if (IsPawn[piece]) {
                (piece === Piece.whitePawn ? this.whitePawnFiles : this.blackPawnFiles)[GetFile[sq]] |= RankToBits[GetRank[sq]];
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
        const origIsTarget = isTargetPiece[originalPiece];
        let totalMove = dir;
        let targetColor = Color.none;
        while (true) {
            if (sqOffboard(sq + totalMove)) break;
            const piece = this.board.getPiece(sq + totalMove);
            if (isTargetPiece[piece]
                && (targetColor === Color.none || PieceColor[piece] === targetColor) // second piece of same color and type -> add battery
                && !(origIsTarget && PieceColor[piece] === PieceColor[originalPiece])) { // same color and type as original piece -> don't double count battery
                this.updateAttackRay(piece, sq, -dir, isTargetPiece, multiplier);
                targetColor = PieceColor[piece];
            }
            if (piece !== Piece.none && !(isTargetPiece[piece] && PieceColor[piece] === targetColor)) break;

            totalMove += dir;
        }
    }

    private updateAttackRay(originalPiece: Piece, sq: Square, dir: number, isTargetPiece: boolean[], multiplier: AttackValMultiplier): void {
        let totalMove = dir;
        while (true) {
            if (sqOffboard(sq + totalMove)) break;
            this.updateAttack(originalPiece, sq + totalMove, multiplier);
            const piece = this.board.getPiece(sq + totalMove);
            if (piece !== Piece.none && !(PieceColor[piece] === PieceColor[originalPiece] && isTargetPiece[piece])) break;
            totalMove += dir;
        }
    }

    private updateAttack(piece: Piece, sq: Square, multiplier: AttackValMultiplier) {
        const color = PieceColor[piece];
        if (color === Color.white) {
            this.whiteAttacks[GetSq64[sq]] += PieceAttackVal[piece] * multiplier;
            this.attackSums[Color.white] += PieceAttackVal[piece] * multiplier;
        }
        else {
            this.blackAttacks[GetSq64[sq]] += PieceAttackVal[piece] * multiplier;
            this.attackSums[Color.black] += PieceAttackVal[piece] * multiplier;
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

    public getCoverage(color: Color): number {
        return 0;
    }

    public isOpen(file: File, color: Color): FileStatus {
        return FileStatus.closed;
    }

    public inCheck(color: Color): boolean {
        const kingSq = this.board.getSquares(Kings[color]).next().value;
        if (kingSq === undefined) throw new Error(`${getColorString(color)} king not found`);
        return this.board.attackTable.getAttacks(kingSq, GetOtherSide[color]) !== 0;
    }

    public updateFrom(piece: Piece, sq: Square): void {}
    public updateTo(piece: Piece, sq: Square): void {}
}