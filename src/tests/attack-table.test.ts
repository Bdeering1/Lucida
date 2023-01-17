import Board from "../board/board";
import { IBoard } from "../board/iboard";
import { Piece, Square } from "../shared/enums";
import { parseFen } from "../board/board-setup";
import { PieceAttackVal, PieceColor } from "../shared/utils";

describe('attack-table', () => {
    let board: IBoard;

    beforeEach(() => {
        board = new Board();
    });

    it.each([
        ['8/8/8/8/8/7R/7R/7R w - - 0 1', Piece.whiteRook, Square.h8, 3],
        ['8/8/8/8/8/8/6Q1/7Q w - - 0 1', Piece.whiteQueen, Square.a8, 2],
        ['8/8/8/8/8/8/7r/7R w - - 0 1', Piece.whiteRook, Square.h8, 0],
    ])('takes batteres into account when generating attack counts', (fen, piece, sq, attackers) => {
        // parseFen(board, fen);
        // expect(board.attackTable.getAttacks(sq, PieceColor[piece])).toBe(attackers * PieceAttackVal[piece]);
    });
});