/* eslint-disable no-magic-numbers */

import { Color, Piece } from "../shared/enums";
import { GetSq120, PieceColor, SideMultiplier } from "../shared/utils";
import { IBoard } from "../board/board-types";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";
import MoveManager from "../game/move-manager";
import PieceSquareTables from "./pst";

const MAX_PHASE = 256;

export default class Evaluation {

    /**
     * The weight of the mobility score in the evaluation function
     * @description each 1 weight = 0.5 centipawns per move advantage
     */
    static mobilityWeight = 8;

    /**
     * The weight of each piece type when determining game phase
     */
    static pawnPhase = 0;
    static knightPhase = 1;
    static bishopPhase = 1;
    static rookPhase = 2;
    static queenPhase = 4;
    static totalPhase: number;

    static init() {
        Evaluation.totalPhase = Evaluation.pawnPhase * 16
                              + Evaluation.knightPhase * 4
                              + Evaluation.bishopPhase * 4
                              + Evaluation.rookPhase * 4
                              + Evaluation.queenPhase * 2;
    }

    static evaluate(board: IBoard, moveManager: MoveManager): number {
        let score = board.material[Color.white] - board.material[Color.black];

        score += Evaluation.getMobilityScore(moveManager);
        score += Evaluation.getPSTScore(board);

        return score;
    }

    static getMobilityScore(moveManager: MoveManager) {
        const whiteMobility = moveManager.generateMoves(Color.white, false);
        const blackMobility = moveManager.generateMoves(Color.black, false);

        return ~~( (whiteMobility - blackMobility) / 2 ) * Evaluation.mobilityWeight;
    }

    static getPSTScore(board: IBoard): number {
        let pstScore = 0;
        for (let sq64 = 0; sq64 < INNER_BOARD_SQ_NUM ; sq64++) {
            const sq = GetSq120[sq64];
            const piece = board.getPiece(sq);
            if (piece === Piece.none) continue;

            const side = PieceColor[piece];
            pstScore += PieceSquareTables.middleGame[piece][sq] * SideMultiplier[side];
        }

        return pstScore;
    }

    static getGamePhase(board: IBoard): number {
        let phase = Evaluation.totalPhase;
        phase -= board.getNumPieces(Piece.whitePawn) * Evaluation.pawnPhase;
        phase -= board.getNumPieces(Piece.whiteKnight) * Evaluation.knightPhase;
        phase -= board.getNumPieces(Piece.whiteBishop) * Evaluation.bishopPhase;
        phase -= board.getNumPieces(Piece.whiteRook) * Evaluation.rookPhase;
        phase -= board.getNumPieces(Piece.whiteQueen) * Evaluation.queenPhase;
        phase -= board.getNumPieces(Piece.blackPawn) * Evaluation.pawnPhase;
        phase -= board.getNumPieces(Piece.blackKnight) * Evaluation.knightPhase;
        phase -= board.getNumPieces(Piece.blackBishop) * Evaluation.bishopPhase;
        phase -= board.getNumPieces(Piece.blackRook) * Evaluation.rookPhase;
        phase -= board.getNumPieces(Piece.blackQueen) * Evaluation.queenPhase;

        return (phase * MAX_PHASE) / Evaluation.totalPhase;
    }
}