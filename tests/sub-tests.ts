import { ParseFen, SqAttacked, GameBoard, GeneratePosKey } from "../src/board";
import { InitFilesRanksBrd, InitHashKeys, InitSq120ToSq64 } from "../src/initialize";
import { BRD_SQ_NUM, START_FEN, PIECE_CHAR } from "../src/shared/constants";
import { SQUARES, RANKS, FILES, COLOURS, PIECES } from "../src/shared/enums";
import { RanksBoard, FilesBoard, PieceKeys, Sq120ToSq64, Sq64ToSq120, fileRankToSq, PieceIndex, Sq120, PieceCol, PieceVal } from "../src/shared/utils";
import { PrintSubResult, VERBOSE, PrintSqAttackedResults, VISUAL } from "./debug-io";

/*INIT TESTS*/
export function InitFilesRanksBrdTest() {
    InitFilesRanksBrd();
    if (RanksBoard[SQUARES.A8] != RANKS.RANK_8 || FilesBoard[SQUARES.H1] != FILES.FILE_H) {
        var line = "   ";
        console.log("FilesBoard");
        for (let i = 0; i < BRD_SQ_NUM; i++) {
            line += FilesBoard[i].toString().padEnd(4);
            if ((i + 1) % 10 === 0) {
                console.log(line);
                line = "   ";
            }
        }
        console.log("RanksBoard");
        for (let i = 0; i < BRD_SQ_NUM; i++) {
            line += RanksBoard[i].toString().padEnd(4);
            if ((i + 1) % 10 === 0) {
                console.log(line);
                line = "   ";
            }
        }
        console.log("\nRanksBoard[SQUARES.A8] = " + RanksBoard[SQUARES.A8]);
        console.log("FilesBoard[SQUARES.H1] = " + FilesBoard[SQUARES.H1]);
        PrintSubResult(false);
        return false;
    } else {
        if (VERBOSE) PrintSubResult(true);
        return true;
    }
}

export function InitHashKeysTest() {
    InitHashKeys();
    if (PieceKeys[13 * 120 - 1] == null) {
        PrintSubResult(false);
        return false;
    } else {
        if (VERBOSE) PrintSubResult(true);
        return true;
    }
}

export function InitSq120ToSq64Test() {
    InitSq120ToSq64();
    if (Sq120ToSq64[SQUARES.A8] != 0 || Sq64ToSq120[63] != SQUARES.H1) {
        var sq64 = 0;
        var line = "   ";
        console.log("Sq120ToSq64");
        for (let sq = 0; sq < BRD_SQ_NUM; sq++) {
            line += Sq120ToSq64[sq].toString().padEnd(4);
            if ((sq + 1) % 10 == 0) {
                console.log(line);
                line = "   ";
            }
        }
        console.log("Sq64ToSq120");
        for (let rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
            for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
                line += Sq64ToSq120[sq64].toString().padEnd(4);
                sq64++;
            }
            console.log(line);
            line = "   ";
        }
        console.log("\nSq120ToSq64[SQUARES.A8] = " + Sq120ToSq64[SQUARES.A8] + ", " + "Sq64ToSq120[63] = " + Sq64ToSq120[63]);
        PrintSubResult(false);
        return false;
    } else {
        if (VERBOSE) PrintSubResult(true);
        return true
    }
}

/* BOARD TESTS */

export function SqAttackedTest() {
    let isPass = true;

    ParseFen(START_FEN);
    if (SqAttacked(SQUARES.A1, COLOURS.WHITE)) {
        PrintSqAttackedResults();
        console.log("Position 1/3");
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 1/3");
        PrintSubResult(true);
    }

    ParseFen("r3k2r/8/8/3N4/8/8/8/R3K2R w KQkq - 0 1");
    if (!SqAttacked(fileRankToSq(FILES.FILE_C, RANKS.RANK_7), COLOURS.WHITE)) {
        PrintSqAttackedResults();
        console.log("Position 2/3");
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 2/3");
        PrintSubResult(true);
    }

    ParseFen("4k3/8/8/3q4/8/8/2B5/4K3 w - - 0 1");
    if (!SqAttacked(fileRankToSq(FILES.FILE_H, RANKS.RANK_1), COLOURS.BLACK)) {
        PrintSqAttackedResults();
        console.log("Position 3/3");
        PrintSubResult(false);
        isPass = false;
    } else {
        if (VISUAL) {
            PrintSqAttackedResults();
        }
        if (VERBOSE) {
            console.log("Position 3/3");
            PrintSubResult(true);
        }
    }
    return isPass;
}

export function CheckBoard() { /*check what col and pcount were supposed to be for*/
    var t_numPieces = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var t_material = [0, 0];
    var sq64, sq120, pceType, pceNum, col, pcount;

    /*checking pList against pieces*/
    for (pceType = PIECES.wP; pceType < PIECES.bK; pceType++) {
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq120 = GameBoard.pList[PieceIndex(pceType, pceNum)];
            if (GameBoard.pieces[sq120] != pceType) {
                console.log("Error: GameBoard.pList - piece: " + PIECE_CHAR[pceType]);
                return false;
            }
        }
    }
    /*checking numPieces and material against pieces*/
    for (sq64 = 0; sq64 < 64; sq64++) {
        sq120 = sq120(sq64);
        pceType = GameBoard.pieces[sq120];
        t_numPieces[pceType]++;
        t_material[PieceCol[pceType]] += PieceVal[pceType];
    }
    for (pceType = PIECES.wP; pceType < PIECES.bK; pceType++) {
        if (t_numPieces[pceType] != GameBoard.numPieces[pceType]) {
            console.log("Error: GameBoard.numPieces - piece: " + PIECE_CHAR[pceType]);
            return false;
        }
    }
    if (t_material[COLOURS.WHITE] != GameBoard.material[COLOURS.WHITE] || t_material[COLOURS.BLACK] != GameBoard.material[COLOURS.BLACK]) {
        console.log("Error: GameBoard.material");
        return false;
    }
    if (GameBoard.side != COLOURS.WHITE && GameBoard.side != COLOURS.BLACK) {
        console.log("Error: GameBoard.side");
        return false;
    }
    if (GeneratePosKey() != GameBoard.posKey) {
        console.log("Error: GameBoard.posKey");
        return false;
    }

    return true;
}

export function MoveUndoMoveTest(ply, castlePerm, enPas, listStart, nextStart) {
    if (!CheckBoard()) {
        return false;
    } else if (ply != GameBoard.ply) {
        console.log("Error: GameBoard.ply");
        return false;
    } else if (castlePerm != GameBoard.castlePerm) {
        console.log("Error: GameBoard.castlePerm");
        return false;
    } else if (enPas != GameBoard.enPas) {
        console.log("Error: GameBoard.enPas");
        return false;
    } else if (listStart != GameBoard.moveListStart[GameBoard.ply]) {
        console.log("Error: GameBoard.moveListStart[GameBoard.ply]");
        return false;
    } else if (nextStart != GameBoard.moveListStart[GameBoard.ply + 1]) {
        console.log("Error: GameBoard.moveListStart[GameBoard.ply + 1]");
        return false;
    }

    return true;
}