import { GetRank, GetSq120 } from "../board/board-utils";
import { FILE_CHAR, INNER_BOARD_SQ_NUM, PIECE_CHAR } from "../shared/constants";
import { Board } from "../board/board";

export function printBoard(board: Board) {
    console.log("\n");

    let line = "  ";
    for (let i = 0; i < 8; i++) {
        line += `${FILE_CHAR[i]} `;
    }
    for (let sq = 0; sq < INNER_BOARD_SQ_NUM; sq++) {
        if (sq % 8 === 0) {
            console.log(line);
            line = `${GetRank[GetSq120[sq]]} `;
        }
        line += `${PIECE_CHAR[board.getPiece(GetSq120[sq])]} `;
    }
    console.log(line);
    console.log("\n");
}

export function printBoard120(board: Board) {
    throw new Error("Method not implemented.");
}