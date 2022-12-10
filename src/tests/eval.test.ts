/* eslint-disable no-magic-numbers */
import { CARO_KANN_FEN, DOUBLE_EN_PAS_FEN, KINGS_AND_PAWNS_FEN } from "./test-constants";
import Eval, { MAX_PHASE } from "../intelligence/eval";
import Board from "../board/board";
import { IBoard } from "../board/board-types";
import MoveManager from "../game/move-manager";
import { START_FEN } from "../shared/constants";
import { parseFen } from "../board/board-setup";


describe('eval', () => {
    let board: IBoard;
    let moveManager: MoveManager;

    beforeEach(() => {
        board = new Board();
        moveManager = new MoveManager(board);
    });

    it.each([
        [START_FEN, 0],
        [CARO_KANN_FEN, 4],
        [DOUBLE_EN_PAS_FEN, -1]
    ])('returns the correct mobility score for test positions', (fen, expectedScore) => {
        parseFen(board, fen);
        expect(Eval.getMobilityScore(moveManager)).toBe(expectedScore);
    });

    it('returns a game phase of zero for the starting position', () => {
        parseFen(board, START_FEN);
        expect(Eval.getGamePhase(board)).toBe(0);
        Eval.init();
    });

    it('retuns the maximum game phase for a position with only kings and pawns left', () => {
        parseFen(board, KINGS_AND_PAWNS_FEN);
        expect(Eval.getGamePhase(board)).toBe(MAX_PHASE);
    });
});