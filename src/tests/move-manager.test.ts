/* eslint-disable no-magic-numbers */

import Board from "../board/board";
import { IBoard } from "../board/board-types";
import MoveManager from "../board/move-manager";
import { CASTLE_TEST_FEN, EN_PAS_TEST_FEN, START_FEN } from "../shared/constants";
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
        ['8/4n3/5p2/8/r2PK3/8/4k2b/8 w - - 0 1', 0],
        ['4k3/8/8/b7/8/5q2/P7/R3K2R w KQ - 0 1', 0],
    ])('generates the right number of moves for common positions', (fen, moves) => {
        parseFen(board, fen);
        expect(moveManager.generateMoves()).toBe(moves);
    });
});