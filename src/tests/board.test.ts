/* eslint-disable no-magic-numbers */

import { CAPTURE_FEN, CASTLE_FEN, EN_PAS_FEN } from "./test-constants";
import { Color, Piece, Square } from "../shared/enums";
import { PieceColor, PieceVal } from "../shared/utils";
import Board from "../board/board";
import { IBoard } from "../board/iboard";
import Move from "../game/move";
import { START_FEN } from "../shared/constants";
import { getCastleString } from "../cli/printing";
import { parseFen } from "../board/board-setup";

describe('board', () => {
    let board: IBoard;

    beforeEach(() => {
        board = new Board();
    });

    it.each([
        [Piece.whitePawn, Square.a1],
        [Piece.whiteRook, Square.d4],
        [Piece.blackKing, Square.h8],
    ])('can add pieces to the board', (piece, sq) => {
        //jest.spyOn(board, 'hashPiece');
        board.addPiece(piece, sq);
        expect(board.getPiece(sq)).toBe(piece);
        expect(board.material[PieceColor[piece]]).toBe(PieceVal[piece]);
        //expect(board.hashPiece).toBeCalled();
    });

    it('can return an iterator for the squares of a given piece', () => {
        board.addPiece(Piece.blackQueen, Square.b2);
        board.addPiece(Piece.blackQueen, Square.g7);
        const squares = board.getSquares(Piece.blackQueen);
        expect(squares.next().value).toBe(Square.g7);
        expect(squares.next().value).toBe(Square.b2);
        expect(squares.next().done).toBe(true);
    });

    it.each([
        [Piece.whitePawn, Square.a8],
        [Piece.blackPawn, Square.e5],
        [Piece.whiteQueen, Square.h1],
    ])('can remove pieces from the board', (piece, sq) => {
        //jest.spyOn(board, 'hashPiece');
        board.addPiece(piece, sq);
        board.removePiece(sq);
        expect(board.getPiece(sq)).toBe(Piece.none);
        expect(board.material[PieceColor[piece]]).toBe(0);
        //expect(board.hashPiece).toBeCalled();
    });

    it.each([
        [Square.a1, Square.a8, Piece.whitePawn],
        [Square.a1, Square.h8, Piece.whiteRook],
        [Square.h1, Square.a8, Piece.blackKing],
    ])('can move a piece from one square to another', (from, to, piece) => {
        board.addPiece(piece, from);
        board.makeMove(new Move(from, to));
        expect(board.getPiece(from)).toBe(Piece.none);
        expect(board.getPiece(to)).toBe(piece);
    });

    it('can castle kingside', () => {
        parseFen(board, CASTLE_FEN);
        board.makeMove(new Move(Square.e1, Square.g1));
        board.makeMove(new Move(Square.e8, Square.g8));
        expect(board.getPiece(Square.g1)).toBe(Piece.whiteKing);
        expect(board.getPiece(Square.f1)).toBe(Piece.whiteRook);
        expect(board.getPiece(Square.e1)).toBe(Piece.none);
        expect(board.getPiece(Square.h1)).toBe(Piece.none);
        expect(board.getPiece(Square.g8)).toBe(Piece.blackKing);
        expect(board.getPiece(Square.f8)).toBe(Piece.blackRook);
        expect(board.getPiece(Square.e8)).toBe(Piece.none);
        expect(board.getPiece(Square.h8)).toBe(Piece.none);
    });

    it('can castle queenside', () => {
        parseFen(board, CASTLE_FEN);
        board.makeMove(new Move(Square.e1, Square.c1));
        board.makeMove(new Move(Square.e8, Square.c8));
        expect(board.getPiece(Square.c1)).toBe(Piece.whiteKing);
        expect(board.getPiece(Square.d1)).toBe(Piece.whiteRook);
        expect(board.getPiece(Square.e1)).toBe(Piece.none);
        expect(board.getPiece(Square.a1)).toBe(Piece.none);
        expect(board.getPiece(Square.c8)).toBe(Piece.blackKing);
        expect(board.getPiece(Square.d8)).toBe(Piece.blackRook);
        expect(board.getPiece(Square.e8)).toBe(Piece.none);
        expect(board.getPiece(Square.a8)).toBe(Piece.none);
    });

    it.each([
        [Square.e1, Square.e2, 'kq'],
        [Square.e8, Square.e7, 'KQ'],
        [Square.a1, Square.a2, 'Kkq'],
        [Square.h8, Square.h7, 'KQq'],
    ])('updates castling permissions if a king or rook move for the first time', (from, to, permissions) => {
        parseFen(board, CASTLE_FEN);
        board.makeMove(new Move(from, to));
        expect(getCastleString(board)).toBe(permissions);
    });

    it.each([
        [Square.e1, Square.e2],
        [Square.c5, Square.c6],
    ])('updates en passent permissions if a player does not take en passent', (from, to) => {
        parseFen(board, EN_PAS_FEN);
        board.makeMove(new Move(from, to));
        expect(board.enPas).toBe(Square.none);
    });

    it('updates the position key correctly when pieces are added and removed', () => {
        board.addPiece(Piece.whitePawn, Square.e5);
        expect(board.posKey).not.toEqual(0);
        board.removePiece(Square.e5);
        expect(board.posKey).toBe(0);
    });

    it('updates the position key correctly when castle permissions change', () => {
        //jest.spyOn(board, 'hashCastle');
        parseFen(board, CASTLE_FEN);
        const startingKey = board.posKey;
        board.makeMove(new Move(Square.e1, Square.e2));
        //expect(board.hashCastle).toBeCalled();
        expect(board.posKey).not.toEqual(startingKey);
    });
    
    it.each([
        [Square.e1, Square.e2],
        [Square.c5, Square.c6],
    ])('updates the position key correctly if a player does not take en passent', () => {
        parseFen(board, EN_PAS_FEN);
        //jest.spyOn(board, 'hashEnPas');
        const startingKey = board.posKey;
        board.makeMove(new Move(Square.c5, Square.c6));
        //expect(board.hashEnPas).toBeCalledTimes(1);
        expect(board.posKey).not.toEqual(startingKey);
    });

    it('can set white king-side castle permission', () => {
        board.setWhiteKingCastle();
        expect(board.whiteKingCastle).toBe(true);
    });

    it('can set white queen-side castle permission', () => {
        board.setWhiteQueenCastle();
        expect(board.whiteQueenCastle).toBe(true);
    });

    it('can set black king-side castle permission', () => {
        board.setBlackKingCastle();
        expect(board.blackKingCastle).toBe(true);
    });

    it('can set black queen-side castle permission', () => {
        board.setBlackQueenCastle();
        expect(board.blackQueenCastle).toBe(true);
    });

    it('can copy make an identical copy of itself (with no shared references)', () => {
        parseFen(board, START_FEN);
        const key = board.posKey;
        const whiteMaterial = board.material[Color.white];
        const copy = board.clone(true);
        board.makeMove(new Move(Square.d2, Square.d4));
        board.makeMove(new Move(Square.e7, Square.e5));
        board.makeMove(new Move(Square.e1, Square.d2));
        board.makeMove(new Move(Square.e5, Square.d4));
        board.makeMove(new Move(Square.c2, Square.c4));
        expect(copy.sideToMove).toBe(Color.white);
        expect(copy.ply).toBe(0);
        expect(copy.enPas).toBe(Square.none);
        expect(copy.whiteKingCastle).toBe(true);
        expect(copy.whiteQueenCastle).toBe(true);
        expect(copy.fiftyMoveCounter).toBe(0);
        expect(copy.posKey).toBe(key);
        expect(copy.material[Color.white]).toBe(whiteMaterial);
        expect(copy.getPiece(Square.d2)).toBe(Piece.whitePawn);
    });

    // it('can be restored to a previous state', () => {
    //     parseFen(board, START_FEN);
    //     const key = board.posKey;
    //     const whiteMaterial = board.material[Color.white];
    //     board.makeMove(new Move(Square.d2, Square.d4));
    //     board.makeMove(new Move(Square.e7, Square.e5));
    //     board.makeMove(new Move(Square.e1, Square.d2));
    //     board.makeMove(new Move(Square.e5, Square.d4));
    //     board.makeMove(new Move(Square.c2, Square.c4));
    //     board.restoreInstance(0);
    //     expect(board.sideToMove).toBe(Color.white);
    //     expect(board.ply).toBe(0);
    //     expect(board.enPas).toBe(Square.none);
    //     expect(board.whiteKingCastle).toBe(true);
    //     expect(board.whiteQueenCastle).toBe(true);
    //     expect(board.fiftyMoveCounter).toBe(0);
    //     expect(board.posKey).toBe(key);
    //     expect(board.material[Color.white]).toBe(whiteMaterial);
    //     expect(board.getPiece(Square.d2)).toBe(Piece.whitePawn);
    // });

    it('can undo and redo moves with no side effects', () => {
        parseFen(board, CAPTURE_FEN);
        const copy = board.clone(true);
        const move = new Move(Square.e4, Square.d5);
        board.makeMove(move);
        board.undoMove(move);
        board.makeMove(move);
        board.undoMove(move);
        expect(board.sideToMove).toBe(copy.sideToMove);
        expect(board.ply).toBe(copy.ply);
        expect(board.fiftyMoveCounter).toBe(copy.fiftyMoveCounter);
        expect(board.posKey).toBe(copy.posKey);
        expect(board.material[Color.black]).toBe(copy.material[Color.black]);
        expect(board.getPiece(Square.e4)).toBe(copy.getPiece(Square.e4));
    });
});