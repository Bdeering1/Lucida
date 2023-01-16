import Board from "../board/board";
import { IBoard } from "../board/iboard";
import Move from "../game/move";
import MoveGenerator from "../game/move-generator";
import { Square } from "../shared/enums";
import { getGameStatus } from "../game/game-state";
import { parseFen } from "../board/board-setup";
import PieceSquareTables from "../intelligence/pst";

describe('game-state', () => {
    let board: IBoard;
    let moveGenerator: MoveGenerator;
    PieceSquareTables.init();

    beforeEach(() => {
        board = new Board();
        moveGenerator = new MoveGenerator(board);
    });

    it.each([
        ['8/8/8/8/8/4k3/8/r3K3 w - - 0 1'],
        ['7k/5p1p/5BpN/8/8/8/8/6K1 b - - 0 1'],
        ['6rk/6pp/6N1/8/8/8/8/6KR b - - 0 1']
    ])('recognizes checkmates', fen => {
        parseFen(board, fen);
        const status = getGameStatus(board, moveGenerator.generateMoves());
        expect(status.complete).toBe(true);
        expect(status.desc).toContain('Checkmate');
    });

    it('recognizes stalemate', () => {
        parseFen(board, '8/8/8/8/8/5k2/5q2/7K w - - 0 1');
        const status = getGameStatus(board, moveGenerator.generateMoves());
        expect(status.complete).toBe(true);
        expect(status.desc).toContain('Stalemate');
    });

    it('recognizes draw by fifty moves', () => {
        parseFen(board, '6k1/8/8/8/8/8/4NB2/6K1 w - - 50 1');
        const status = getGameStatus(board, moveGenerator.generateMoves());
        expect(status.complete).toBe(true);
        expect(status.desc).toContain('fifty moves');
    });

    it('recognizes draw by repetition', () => {
        parseFen(board, '6k1/8/6P1/8/8/8/2N5/6K1 w - - 0 1');
        board.makeMove(new Move(Square.c2, Square.e3));
        board.makeMove(new Move(Square.g8, Square.g7));
        board.makeMove(new Move(Square.e3, Square.c2));
        board.makeMove(new Move(Square.g7, Square.g8));
        board.makeMove(new Move(Square.c2, Square.e3));
        board.makeMove(new Move(Square.g8, Square.g7));
        board.makeMove(new Move(Square.e3, Square.c2));
        board.makeMove(new Move(Square.g7, Square.g8));
        const status = getGameStatus(board, moveGenerator.generateMoves());
        expect(status.complete).toBe(true);
        expect(status.desc).toContain('repetition');
    });

    it('recognizes draw due to insufficient material', () => {
        parseFen(board, '8/8/3k4/2n5/3N4/3K4/8/8 w - - 0 1');
        const status = getGameStatus(board, moveGenerator.generateMoves());
        expect(status.complete).toBe(true);
        expect(status.desc).toContain('insufficient');
    });
});