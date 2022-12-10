/* eslint-disable no-magic-numbers */

import { CASTLE_FEN, CHECKMATE_FEN, EN_PAS_FEN, PROMOTION_FEN, STALEMATE_FEN } from "./test-constants";
import { Color, MoveStatus } from "../shared/enums";
import Board from "../board/board";
import { IBoard } from "../board/board-types";
import MoveManager from "../game/move-manager";
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
        [CASTLE_FEN, 26],
        [EN_PAS_FEN, 7],
        [STALEMATE_FEN, MoveStatus.stalemate],
        [CHECKMATE_FEN, MoveStatus.checkmate],
        [PROMOTION_FEN, 10],
    ])('generates the right number of moves for test positions', (fen, moves) => {
        parseFen(board, fen);
        expect(moveManager.generateMoves()).toBe(moves);
        for (const move of moveManager.getCurrentMoves()) {
            expect(move).toBeDefined();
        }
    });

    it.each([
        [Color.none],
        [Color.white],
        [Color.black],
    ])('will not update the move list when addToList = false', (sideToMove: Color) => {
        parseFen(board, START_FEN);
        const oldMoves = [...moveManager.getCurrentMoves()];
        const oldMoveList = [...moveManager.moveList[board.ply]];
        moveManager.generateMoves(sideToMove, false);
        expect([...moveManager.getCurrentMoves()]).toEqual(oldMoves);
        expect(moveManager.moveList[board.ply]).toEqual(oldMoveList);
    });
});