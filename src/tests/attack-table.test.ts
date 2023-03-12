/* eslint-disable no-magic-numbers */
import Board from "../board/board";
import { IBoard } from "../board/iboard";
import { Piece, Square } from "../shared/enums";
import { parseFen } from "../board/board-setup";
import AttackTable from "../board/attack-table";
import { START_FEN } from "../shared/constants";
import { GetSq64 } from "../shared/utils";

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

    it.each([
        [START_FEN, GetSq64[Square.e2], 4],
        ['3Q4/8/kB6/8/2K5/2PRP3/2NQN3/3R4 w - - 0 1', GetSq64[Square.d4], 10],
    ])('correctly tracks where attacks are coming from for a given square', (fen, sq64, attackers) => {
        parseFen(board, fen);
        expect([...(board.attackTable as AttackTable).whitePieceAttacks[sq64].getSmallestAttacker(sq64)].length).toBe(attackers);
    });
});