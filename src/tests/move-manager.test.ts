/* eslint-disable no-magic-numbers */

import { CASTLE_TEST_FEN, CHECKMATE_TEST_FEN, EN_PAS_TEST_FEN, PROMOTION_TEST_FEN, STALEMATE_TEST_FEN } from "./test-constants";
import Board from "../board/board";
import { IBoard } from "../board/board-types";
import MoveManager from "../game/move-manager";
import { MoveStatus } from "../shared/enums";
import { START_FEN } from "../shared/constants";
import { parseFen } from "../board/board-setup";

describe('move-manager', () => {
    let board: IBoard;
    let moveManager: MoveManager;

    beforeEach(() => {
        board = new Board();
        moveManager = new MoveManager(board);
    });

    it.each([
        [START_FEN, 20],
        ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', 29],
        ['rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w KQkq - 0 2', 20],
        [CASTLE_TEST_FEN, 26],
        [EN_PAS_TEST_FEN, 7],
        [STALEMATE_TEST_FEN, MoveStatus.stalemate],
        [CHECKMATE_TEST_FEN, MoveStatus.checkmate],
        [PROMOTION_TEST_FEN, 10],
    ])('generates the right number of moves for test positions', (fen, moves) => {
        parseFen(board, fen);
        expect(moveManager.generateMoves()).toBe(moves);
        for (const move of moveManager.getCurrentMoves()) {
            expect(move).toBeDefined();
        }
    });
});