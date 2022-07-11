/* eslint-disable no-magic-numbers */
import { BOARD_SQ_NUM, FILE_CHAR, INNER_BOARD_SQ_NUM, PIECE_CHAR } from "../shared/constants";
import { GenerateHash32, GetRank, GetSq120 } from "../board/board-utils";
import { Board } from "../board/board";

export function printBoard(board: Board) {
    console.log("\n  a b c d e f g h");

    const lines = [];
    let line = "";
    for (let sq = 0; sq < INNER_BOARD_SQ_NUM; sq++) {
        if (sq % 8 === 0) {
            lines.push(line);
            line = `${GetRank[GetSq120[sq]]} `;
        }
        line += `${PIECE_CHAR[board.getPiece(GetSq120[sq])]} `;
    }
    lines.push(line);

    for (const l of lines.reverse()) {
        console.log(l);
    }
    console.log("\n");
}

export function printBoard120(board: Board) {
    console.log("\n    a b c d e f g h");

    const lines = [];
    let line = "";
    for (let sq = 0; sq < BOARD_SQ_NUM; sq++) {
        if (sq % 10 === 0) {
            lines.push(line);
            line = `${GetRank[sq + 1] !== 0 ? GetRank[sq + 1] : " "} `;
        }
        line += `${PIECE_CHAR[board.getPiece(sq)]} `;
    }
    lines.push(line);

    for (const l of lines.reverse()) {
        console.log(l);
    }
    console.log("\n");
}

export function printGeneratedHashes() {
    for (let i = -7; i < 8; i++) {
        const hash = GenerateHash32(i);
        console.log(`${toBinaryString(hash)} (${hash})`);
    }
}

function toBinaryString(num: number) {
    return (num >>> 0).toString(2).padStart(32, "0");
}