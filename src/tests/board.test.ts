/* eslint-disable dot-notation */
/* eslint-disable no-magic-numbers */

import { Board, BoardMeta } from "../board/board";
import { IBoard } from "../board/board-types";

describe('board', () => {
    let board: IBoard;

    beforeEach(() => {
        board = new Board(new BoardMeta());
        console.log(`${board.meta.whiteKingCastle}`);
    });

    it.todo('can add a piece to the board')

    it.todo('updates castling permissions if a king or rook move for the first time');

    it.todo('updates en passent permissions if a player does not take en passent');

    it.todo('updates the position key correctly when a piece moves');

    it.todo('updates the position key correctly when castle permissions change');
    
    it.todo('updates the position key correctly if a player does not take en passent');

    it.todo('can detect whether or not a square is attacked');

    it('sets white king-side castle permissions correctly', () => {
        board.meta.setWhiteKingCastle();
        expect(board.meta.whiteKingCastle).toBe(true);
    });

    it('sets white queen-side castle permissions correctly', () => {
        board.meta.setWhiteQueenCastle();
        expect(board.meta.whiteQueenCastle).toBe(true);
    });

    it('sets black king-side castle permissions correctly', () => {
        board.meta.setBlackKingCastle();
        expect(board.meta.blackKingCastle).toBe(true);
    });

    it('sets black queen-side castle permissions correctly', () => {
        board.meta.setBlackQueenCastle();
        expect(board.meta.blackQueenCastle).toBe(true);
    });

    it('resets castle permissions correctly', () => {
        board.meta.setWhiteKingCastle();
        board.meta.setWhiteQueenCastle();
        board.meta.setBlackKingCastle();
        board.meta.setBlackQueenCastle();
        board.meta.resetCastling();
        expect(board.meta.whiteKingCastle).toBe(false);
        expect(board.meta.whiteQueenCastle).toBe(false);
        expect(board.meta.blackKingCastle).toBe(false);
        expect(board.meta.blackQueenCastle).toBe(false);
    });

});

describe('board setup', () => {

    it.todo('populates certain properties on creation');

    it.todo('parses the starting FEN correctly');

});