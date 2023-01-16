/* eslint-disable no-magic-numbers */

import { CASTLE_FEN, CHECKMATE_FEN, EN_PAS_FEN, PROMOTION_FEN, STALEMATE_FEN } from "./test-constants";
import { Color, MoveStatus } from "../shared/enums";
import Board from "../board/board";
import { IBoard } from "../board/iboard";
import MoveGenerator from "../game/move-generator";
import { START_FEN } from "../shared/constants";
import { parseFen } from "../board/board-setup";
import PieceSquareTables from "../intelligence/pst";

describe('move-manager', () => {
    let board: IBoard;
    let moveGenerator: MoveGenerator;
    PieceSquareTables.init();

    beforeEach(() => {
        board = new Board();
        moveGenerator = new MoveGenerator(board);
    });

    it.each([
        [START_FEN, 20],
        ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', 29],
        ['rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w KQkq - 0 2', 20],
        [CASTLE_FEN, 26],
        [EN_PAS_FEN, 7],
        [STALEMATE_FEN, MoveStatus.stalemate],
        [CHECKMATE_FEN, MoveStatus.checkmate],
        [PROMOTION_FEN, 10],
    ])('generates the right number of moves for test positions', (fen, moves) => {
        parseFen(board, fen);
        expect(moveGenerator.generateMoves()).toBe(moves);
        for (const move of moveGenerator.getCurrentMoves()) {
            expect(move).toBeDefined();
        }
    });

    it.each([
        [Color.none],
        [Color.white],
        [Color.black],
    ])('will not update the move list when addToList = false', (sideToMove: Color) => {
        parseFen(board, START_FEN);
        const oldMoves = [...moveGenerator.getCurrentMoves()];
        const oldMoveList = [...moveGenerator.moveList[board.ply]];
        moveGenerator.generateMoves(sideToMove, false);
        expect([...moveGenerator.getCurrentMoves()]).toEqual(oldMoves);
        expect(moveGenerator.moveList[board.ply]).toEqual(oldMoveList);
    });
});