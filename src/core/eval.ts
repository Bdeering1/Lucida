/* eslint-disable no-magic-numbers */

import { Color, Piece, File } from "../shared/enums";
import { GetFile, GetSq120, GetSq64, IsQueen, PawnDir, PieceColor, SideMultiplier } from "../shared/utils";
import AttackTable, { IAttackTable } from "../board/attack-table";
import { IBoard } from "../board/iboard";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";
import Move from "../game/move";
import MoveGenerator from "../game/move-generator";
import PieceSquareTables from "./pst";

const ENDGAME_MATERIAL_WEIGHT = 2.5;
const PST_WEIGHT = 1.5;
const COVERAGE_WEIGHT = 1;
const ROOKS_SCORE_WEIGHT = 5;
const KINGS_SCORE_WEIGHT = 3;

const PAWN_PHASE = 1;
const KNIGHT_PHASE = 4;
const BISHOP_PHASE = 4;
const ROOK_PHASE = 8;
const QUEEN_PHASE = 16;
export const MAX_PHASE = 256;

export default class Eval {

    /**
     * The weight of the mobility score in the evaluation function
     * @description each 1 weight = 0.5 centipawns per move advantage
     */
    static mobilityWeight = 0;

    /**
     * The weight of each piece type when determining game phase
     */
    static totalPhase: number = 16 * PAWN_PHASE
                               + 4 * KNIGHT_PHASE
                               + 4 * BISHOP_PHASE
                               + 4 * ROOK_PHASE
                               + 2 * QUEEN_PHASE;

    static evaluate(board: IBoard, moveGenerator: MoveGenerator): number {        
        const phase = this.getGamePhase(board);
        let middlegame = this.getMaterialScore(board);
        let endgame = this.getMaterialScore(board, ENDGAME_MATERIAL_WEIGHT);
        middlegame += this.getPSTScore(board, PieceSquareTables.middlegame) * PST_WEIGHT;
        middlegame += this.getKingsScore(board) * KINGS_SCORE_WEIGHT;
        endgame += this.getPSTScore(board, PieceSquareTables.endgame) * PST_WEIGHT;
        
        let score = this.getTaperedScore(middlegame, endgame, phase);
        score += this.getCoverageScore(board.attackTable) * COVERAGE_WEIGHT;
        //score += this.getPawnScore(board);
        score += this.getRooksScore(board) * ROOKS_SCORE_WEIGHT;
        if (this.mobilityWeight !== 0) score += this.getMobilityScore(moveGenerator) * this.mobilityWeight;
        
        if (board.sideToMove === Color.white) score += 5;
        else score -= 5;

        return score * SideMultiplier[board.sideToMove];
    }

    static getMaterialScore(board: IBoard, multiplier = 1): number {
        return (board.material[Color.white] - board.material[Color.black]) * multiplier;
    }

    static getMobilityScore(moveGenerator: MoveGenerator) {
        const whiteMobility = moveGenerator.generateMoves(Color.white, false);
        const blackMobility = moveGenerator.generateMoves(Color.black, false);

        return ~~( (whiteMobility - blackMobility) / 2 );
    }

    static getCoverageScore(attackTable: IAttackTable) {
        return ((attackTable.getCoverage(Color.white) - attackTable.getCoverage(Color.black)) / 4) | 0;
    }

    static getPawnScore(board: IBoard) { // this info could be stored in the attack table
        let score = 0;
        for (const sq of board.getSquares(Piece.whitePawn)) {
            if (board.getPiece(sq + PawnDir[Piece.whitePawn]) === Piece.none) score++;
        }
        for (const sq of board.getSquares(Piece.blackPawn)) {
            if (board.getPiece(sq + PawnDir[Piece.blackPawn]) === Piece.none) score--;
        }
        return score;
    }

    static getRooksScore(board: IBoard) {
        let score = 0;
        for (const sq of board.getSquares(Piece.whiteRook)) {
            score += board.attackTable.isOpen(GetFile[sq], Color.white);
            //if ((board.attackTable as AttackTable).whiteSquareAttacks[GetSq64[sq]].isAttackedBy(Piece.whiteRook)) score++;
        }
        for (const sq of board.getSquares(Piece.blackRook)) {
            score -= board.attackTable.isOpen(GetFile[sq], Color.black);
            //if ((board.attackTable as AttackTable).blackSquareAttacks[GetSq64[sq]].isAttackedBy(Piece.blackRook)) score--;
        }
        return score;
    }

    static getKingsScore(board: IBoard) {
        let score = 0;
        const whiteKingFile = GetFile[board.getSquares(Piece.whiteKing).next().value];
        score -= board.attackTable.isOpen(whiteKingFile, Color.white);
        if (whiteKingFile !== File.a) score -= board.attackTable.isOpen(whiteKingFile - 1, Color.white);
        if (whiteKingFile !== File.h) score -= board.attackTable.isOpen(whiteKingFile + 1, Color.white);

        const blackKingFile = GetFile[board.getSquares(Piece.blackKing).next().value];
        score += board.attackTable.isOpen(blackKingFile, Color.black);
        if (blackKingFile !== File.a) score += board.attackTable.isOpen(blackKingFile - 1, Color.black);
        if (blackKingFile !== File.h) score += board.attackTable.isOpen(blackKingFile + 1, Color.black);

        return score;
    }

    static getPSTScore(board: IBoard, table: number[][]): number {
        let pstScore = 0;
        for (let sq64 = 0; sq64 < INNER_BOARD_SQ_NUM ; sq64++) {
            const sq = GetSq120[sq64];
            const piece = board.getPiece(sq);
            if (piece === Piece.none) continue;

            const side = PieceColor[piece];
            pstScore += table[piece][sq] * SideMultiplier[side];
        }

        return pstScore;
    }

    static getGamePhase(board: IBoard): number {
        let phase = this.totalPhase;
        phase -= board.quantities[Piece.whitePawn] * PAWN_PHASE;
        phase -= board.quantities[Piece.blackPawn] * PAWN_PHASE;
        phase -= board.quantities[Piece.whiteKnight] * KNIGHT_PHASE;
        phase -= board.quantities[Piece.blackKnight] * KNIGHT_PHASE;
        phase -= board.quantities[Piece.whiteBishop] * BISHOP_PHASE;
        phase -= board.quantities[Piece.blackBishop] * BISHOP_PHASE;
        phase -= board.quantities[Piece.whiteRook] * ROOK_PHASE;
        phase -= board.quantities[Piece.blackRook] * ROOK_PHASE;
        phase -= board.quantities[Piece.whiteQueen] * QUEEN_PHASE;
        phase -= board.quantities[Piece.blackQueen] * QUEEN_PHASE;

        return ~~( (phase * MAX_PHASE) / this.totalPhase );
    }

    static getTaperedScore(middlegame: number, endgame: number, phase: number): number {
        return ~~( (middlegame * (MAX_PHASE - phase) + endgame * phase) / MAX_PHASE );
    }

    static getMovePrecedence(board: IBoard, move: Move): number {
        let precedence = 0;

        const piece = board.getPiece(move.from);
        const phase = this.getGamePhase(board);
        const middlegame = PieceSquareTables.middlegame[piece][move.to] - PieceSquareTables.middlegame[piece][move.from];
        const endgame = PieceSquareTables.endgame[piece][move.to] - PieceSquareTables.endgame[piece][move.from];
        precedence += this.getTaperedScore(middlegame, endgame, phase);

        if (IsQueen[move.promotion]) precedence += 200;
        if (move.capture !== Piece.none) precedence += 100;

        return precedence;
    }

    static getKingAttackScore(attackTable: IAttackTable, moveManager: MoveGenerator): number {
        // king attacked score = valueOfAttacks (using PieceAttackVal[piece]) * attackWeight[attackingPiecesCount] / 100
        // https://www.chessprogramming.org/King_Safety
        return 0;
    }
}