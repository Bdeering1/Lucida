/* eslint-disable no-magic-numbers */

import Board from "../board/board";
import { IBoard } from "../board/board-types";
import MoveManager from "../board/move-manager";
import { START_FEN } from "../shared/constants";
import { parseFen } from "../board/board-setup";

describe('move-manager', () => {
    let board: IBoard;
    let moveManager: MoveManager;

    beforeEach(() => {
        board = new Board();
        moveManager = new MoveManager(board);
    });

    // TODO: this should test for castling, en pas, and king checks
    it.each([
        [START_FEN, 20],
        ['rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', 29],
        ['rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w KQkq - 0 2', 20]
    ])('generates the right number of moves for common positions', (fen, moves) => {
        parseFen(board, fen);
        expect(moveManager.generateMoves()).toBe(moves);
    });
});