/* eslint-disable no-magic-numbers */

import { Color, Piece } from "../shared/enums";
import { GetSq120, PieceColor, PieceVal, SideMultiplier } from "../shared/utils";
import { IBoard } from "../board/board-types";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";
import MoveManager from "../game/move-manager";
import PieceSquareTables from "./pst";


export default class Evaluation {

    /**
     * The weight of the mobility score in the evaluation function
     * @description each 1 weight = 0.5 centipawns per move advantage
     */
    static mobilityWeight = 8;
    /**
     * 
     */
    static totalPhase: number;

    static init() {
        Evaluation.totalPhase = PieceVal[Piece.whitePawn] * 16
                              + PieceVal[Piece.whiteKnight] * 4
                              + PieceVal[Piece.whiteBishop] * 4
                              + PieceVal[Piece.whiteRook] * 4
                              + PieceVal[Piece.whiteQueen] * 2;
        console.log(`Total phase: ${Evaluation.totalPhase}`);
    }

    static evaluate(board: IBoard, moveManager: MoveManager): number {
        let score = board.material[Color.white] - board.material[Color.black];

        const whiteMobility = moveManager.generateMoves(Color.white, false);
        const blackMobility = moveManager.generateMoves(Color.black, false);
        score += ~~( (whiteMobility - blackMobility) / 2 ) * Evaluation.mobilityWeight;

        for (let sq64 = 0; sq64 < INNER_BOARD_SQ_NUM ; sq64++) {
            const sq = GetSq120[sq64];
            const piece = board.getPiece(sq);
            if (piece === Piece.none) continue;

            const side = PieceColor[piece];
            score += PieceSquareTables.map[piece][sq] * SideMultiplier[side];
        }

        return score;
    }

    static getGamePhase(board: IBoard): number {
        const material = board.material[Color.white] + board.material[Color.black] - PieceVal[Piece.whiteKing] * 2;
        const phase = material * 100 / Evaluation.totalPhase;
        console.log(`material: ${material} phase: ${phase} totalPhase: ${Evaluation.totalPhase}`);

        return phase;
    }
}