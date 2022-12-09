/* eslint-disable no-magic-numbers */

import { Color, Piece } from "../shared/enums";
import { GetSq120, PieceColor, SideMultiplier } from "../shared/utils";
import { IBoard } from "../board/board-types";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";
import MoveManager from "../game/move-manager";
import PieceSquareTables from "./pst";

const PAWN_PHASE = 0;
const KNIGHT_PHASE = 1;
const BISHOP_PHASE = 1;
const ROOK_PHASE = 2;
const QUEEN_PHASE = 4;
const MAX_PHASE = 256;

export default class Eval {

    /**
     * The weight of the mobility score in the evaluation function
     * @description each 1 weight = 0.5 centipawns per move advantage
     */
    static mobilityWeight = 4;

    /**
     * The weight of each piece type when determining game phase
     */
    static totalPhase: number;

    static init() {
        this.totalPhase = 16 * PAWN_PHASE
                         + 4 * KNIGHT_PHASE
                         + 4 * BISHOP_PHASE
                         + 4 * ROOK_PHASE
                         + 2 * QUEEN_PHASE;
    }

    static evaluate(board: IBoard, moveManager: MoveManager): number {
        let score = board.material[Color.white] - board.material[Color.black];
        score += this.getMobilityScore(moveManager) * this.mobilityWeight;

        const phase = this.getGamePhase(board);
        const middlegame = this.getPSTScore(board, PieceSquareTables.middlegame);
        const endgame = this.getPSTScore(board, PieceSquareTables.endgame);

        const taperedScore = ~~( (middlegame * (MAX_PHASE - phase) + endgame * phase) / MAX_PHASE );
        score += taperedScore;

        return score;
    }

    static getMobilityScore(moveManager: MoveManager) {
        const whiteMobility = moveManager.generateMoves(Color.white, false);
        const blackMobility = moveManager.generateMoves(Color.black, false);

        return ~~( (whiteMobility - blackMobility) / 2 );
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
}