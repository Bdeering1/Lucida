/* eslint-disable no-magic-numbers */
import { CARO_KANN_FEN, DOUBLE_EN_PAS_FEN, KINGS_AND_PAWNS_FEN } from "./test-constants";
import Eval, { MAX_PHASE } from "../intelligence/eval";
import Board from "../board/board";
import { IBoard } from "../board/iboard";
import MoveGenerator from "../game/move-generator";
import { START_FEN } from "../shared/constants";
import { parseFen } from "../board/board-setup";


describe('eval', () => {
    let board: IBoard;
    let moveGenerator: MoveGenerator;

    beforeEach(() => {
        board = new Board();
        moveGenerator = new MoveGenerator(board);
    });

    it.each([
        [START_FEN, 0],
        [CARO_KANN_FEN, 4],
        [DOUBLE_EN_PAS_FEN, -1]
    ])('returns the correct mobility score for test positions without side effects', (fen, expectedScore) => {
        parseFen(board, fen);
        const clone = board.clone(true);
        expect(Eval.getMobilityScore(moveGenerator)).toBe(expectedScore);
        expect(board.sideToMove).toEqual(clone.sideToMove);
        expect(board.fiftyMoveCounter).toEqual(clone.fiftyMoveCounter);
        expect(board.posKey).toBe(clone.posKey);
        expect(board.material).toEqual(clone.material);
        expect(board.repeats).toEqual(clone.repeats);
    });

    it('returns a game phase of zero for the starting position', () => {
        parseFen(board, START_FEN);
        expect(Eval.getGamePhase(board)).toBe(0);
    });

    // it('retuns the maximum game phase for a position with only kings and pawns left', () => {
    //     parseFen(board, KINGS_AND_PAWNS_FEN);
    //     expect(Eval.getGamePhase(board)).toBe(MAX_PHASE);
    // });
});