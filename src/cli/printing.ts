/* eslint-disable no-magic-numbers */
import { BOARD_SQ_NUM, FILE_CHAR, INNER_BOARD_SQ_NUM, PIECE_CHAR } from "../shared/constants";
import { Color, File, Square } from "../shared/enums";
import { GetFile, GetRank, GetSq120, SideMultiplier, generateHash32 } from "../shared/utils";
import Eval from "../intelligence/eval";
import { IAttackTable } from "../board/attack-table";
import { IBoard } from "../board/iboard";
import Move from "../game/move";
import MoveGenerator from "../game/move-generator";
import PieceSquareTables from "../intelligence/pst";

export function printBoard(board: IBoard) {
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
}

export function printBoard120(board: IBoard) {
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
}

export function printAttackTable(table: IAttackTable, color: Color) {
    console.log("\n   a  b  c  d  e  f  g  h");

    const lines = [];
    let line = "";
    for (let sq = 0; sq < INNER_BOARD_SQ_NUM; sq++) {
        if (sq % 8 === 0) {
            lines.push(line);
            line = `${GetRank[GetSq120[sq]]} `;
        }
        line += `${table.isAttacked(GetSq120[sq], color)} `.padStart(3);
    }
    lines.push(line);

    for (const l of lines.reverse()) {
        console.log(l);
    }
}

export function printBoardVars(board: IBoard, verbose = false) {
    if (verbose) console.log(`Hash: ${board.posKey}`);
    console.log(`Side to move: ${getColorString(board.sideToMove)}`);
    console.log(`Ply: ${board.ply + 1} (Move ${getMoveNumber(board.ply)})`);
    if (verbose) {
        console.log(`En pas square: ${getSquareString(board.enPas)}`);
        console.log(`Castle permissions: ${getCastleString(board)}`);
        console.log(`Fifty move counter: ${board.fiftyMoveCounter}`);
        console.log(`Material: ${board.material}\n`);
    }
}

export function printMoves(moves: Move[], moveScores?: number[], scoreMultiplier?: number) {
    let output = "";
    moves.forEach((move, idx) => {
        if (idx !== 0) output += ", ";
        output += `${move}${moveScores ? `: ${moveScores[idx] * (scoreMultiplier ?? 1)}` : ""}`;
    });
    console.log(output);
}

export function getLineString(board: IBoard, moves: Move[], cutoff = Infinity) {
    let output = "";
    moves.forEach((move, idx) => {
        if (idx >= cutoff) return;
        if ((board.ply + idx) % 2 === 0) output += ` ${getMoveNumber(board.ply + idx)}.`;
        output += ` ${move}`;
    });
    return output;
}

export function printEval(board: IBoard, moveManager: MoveGenerator, verbose = false) {
    console.log(`Static eval: ${Eval.evaluate(board, moveManager) * SideMultiplier[board.sideToMove]}`);
    if (verbose) {
        //console.log(`Mobility score: ${Eval.getMobilityScore(moveManager)} Weight: ${Eval.mobilityWeight}`);
        console.log(`Coverage score: ${Eval.getCoverageScore(board.attackTable)}`);
        console.log(`PST scores: MG: ${Eval.getPSTScore(board, PieceSquareTables.middlegame)} EG: ${Eval.getPSTScore(board, PieceSquareTables.endgame)} Phase: ${Eval.getGamePhase(board)}`);
        console.log(`Rooks score: ${Eval.getRooksScore(board)} Kings score: ${Eval.getKingsScore(board)}`);
    }
}

export function printGeneratedHashes() {
    for (let i = -7; i < 8; i++) {
        const hash = generateHash32(i);
        console.log(`${toBinaryString(hash)} (${hash})`);
    }
}

export function getColorString(color: Color) {
    return color === Color.white ? 'white' : color === Color.black ? 'black' : 'N/A';
}

export function getMoveNumber(ply: number) {
    return ply / 2 + 1;
}

export function getSquareString(sq: Square) {
    return GetFile[sq] !== File.none ? FILE_CHAR[GetFile[sq]] + GetRank[sq] : 'N/A';
}

export function getCastleString(board: IBoard) {
    let out = "";
    if (board.whiteKingCastle) out += 'K';
    if (board.whiteQueenCastle) out += 'Q';
    if (board.blackKingCastle) out += 'k';
    if (board.blackQueenCastle) out += 'q';
    return out;
}

function toBinaryString(num: number) {
    return (num >>> 0).toString(2).padStart(32, "0");
}