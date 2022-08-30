/* eslint-disable no-magic-numbers */

import { Board, BoardMeta } from "../board/board";
import { Color, Piece, Square } from "../shared/enums";
import { IBoard } from "../board/board-types";

describe('board', () => {
    let board: IBoard;

    beforeEach(() => {
        board = new Board(new BoardMeta());
    });

    it.each([
        [Piece.none, Square.a1],
        [Piece.whiteRook, Square.d4],
        [Piece.blackKing, Square.h8],
    ])('can add pieces to the board', (piece, sq) => {
        board.addPiece(piece, sq);
        expect(board.getPiece(sq)).toBe(piece);
    });

    it('can return an iterator for all pieces on the board', () => {
        board.addPiece(Piece.whitePawn, Square.a1);
        board.addPiece(Piece.blackKnight, Square.c1);
        const pieces = board.getPieces();
        expect(pieces.next().value).toBe(Piece.whitePawn);
        expect(pieces.next().value).toBe(Piece.none);
        expect(pieces.next().value).toBe(Piece.blackKnight);
    });

    it('can return an iterator for all pieces of a given color on the board', () => {
        board.addPiece(Piece.whiteKnight, Square.b3);
        board.addPiece(Piece.whiteBishop, Square.f7);
        const pieces = board.getPieces(Color.white);
        expect(pieces.next().value).toBe(Piece.whiteKnight);
        expect(pieces.next().value).toBe(Piece.whiteBishop);
        expect(pieces.next().done).toBe(true);
    });

    it('can return an iterator for the squares of a given piece', () => {
        board.addPiece(Piece.blackQueen, Square.b2);
        board.addPiece(Piece.blackQueen, Square.g7);
        const squares = board.getSquares(Piece.blackQueen);
        expect(squares.next().value).toBe(Square.b2);
        expect(squares.next().value).toBe(Square.g7);
        expect(squares.next().done).toBe(true);
    });

    it.each([
        [Piece.none, Square.a8],
        [Piece.blackPawn, Square.e5],
        [Piece.whiteQueen, Square.h1],
    ])('can remove pieces from the board', (piece, sq) => {
        board.addPiece(piece, sq);
        board.removePiece(sq);
        expect(board.getPiece(sq)).toBe(Piece.none);
    });

    it.each([
        [Square.a1, Square.a8, Piece.whitePawn],
        [Square.a1, Square.h8, Piece.whiteRook],
        [Square.h1, Square.a8, Piece.blackKing],
    ])('can move a piece from one square to another', (from, to, piece) => {
        board.addPiece(piece, from);
        board.movePiece(from, to);
        expect(board.getPiece(from)).toBe(Piece.none);
        expect(board.getPiece(to)).toBe(piece);
    });

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