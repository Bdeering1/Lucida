import { CAPTURE_FEN, MATE_IN_ONE_FEN, STALEMATE_IN_ONE_FEN } from "./test-constants";
import { Piece, Square } from "../shared/enums";
import Board from "../board/board";
import { IBoard } from "../board/board-types";
import MiniMax from "../intelligence/search";
import Move from "../game/move";
import MoveManager from "../game/move-manager";
import { parseFen } from "../board/board-setup";

describe('search', () => {
    let board: IBoard;
    let moveManager: MoveManager;
    let miniMax: MiniMax;

    beforeEach(() => {
        const TEST_DEPTH = 5;
        board = new Board();
        moveManager = new MoveManager(board);
        miniMax = new MiniMax(board, moveManager, TEST_DEPTH);
    });

    it.each([
        [CAPTURE_FEN, new Move(Square.c3, Square.b4, Piece.blackPawn)],
        [MATE_IN_ONE_FEN, new Move(Square.c6, Square.c8)],
        [STALEMATE_IN_ONE_FEN, new Move(Square.f3, Square.d2, Piece.blackPawn)]
    ])('should be able to find obvious best moves', (fen, move) => {
        parseFen(board, fen);
        const [bestMove,] = miniMax.getBestMove();
        expect(bestMove).toEqual(move);
    });
});