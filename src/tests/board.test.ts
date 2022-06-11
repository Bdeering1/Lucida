/* eslint-disable no-magic-numbers */

import { Board, BoardMeta } from "../board/board";
import { IBoard } from "../board/board-types";

describe('board', () => {
    let board: IBoard;

    beforeEach(() => {
        board = new Board(new BoardMeta());
        console.log(board);
    });

    it.each([
        [board.meta.setWhiteKingCastle, board.meta.whiteKingCastle],
        [board.meta.setWhiteQueenCastle, board.meta.whiteQueenCastle],
        [board.meta.setBlackKingCastle, board.meta.blackKingCastle],
        [board.meta.setBlackQueenCastle, board.meta.blackQueenCastle],
    ])('sets specific castle permissions properly', (setCastle, getCastle) => {
        setCastle();
        expect(getCastle).toBe(true);
    });

    it.todo('resets castle permissions properly');

    it.todo('updates castling permissions if a king or rook move for the first time');

    it.todo('updates en passent permissions if a player does not take en passent');

    it.todo('can detect whether or not a square is attacked');

});

describe('board setup', () => {

    it.todo('populates certain properties on creation');

    it.todo('parses the starting FEN correctly');

});