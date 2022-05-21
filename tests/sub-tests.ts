import { ParseFen, SqAttacked, GameBoard, GeneratePosKey } from "../src/board/board";
import { InitFilesRanksBrd, InitHashKeys, InitSq120ToSq64 } from "../src/initialize";
import { BRD_SQ_NUM, START_FEN, PIECE_CHAR, Colours, Files, Pieces, Ranks, Squares } from "../src/shared/constants";
import { RanksBoard, FilesBoard, PieceKeys, Sq120ToSq64, Sq64ToSq120, GetSquare, PieceIndex, Sq120, PieceCol, PieceVal } from "../src/shared/utils";
import { PrintSubResult, VERBOSE, PrintSqAttackedResults, VISUAL } from "./debug-io";

/*INIT TESTS*/
export function InitFilesRanksBrdTest() {
    InitFilesRanksBrd();
    if (RanksBoard[Squares.A8] != Ranks.RANK_8 || FilesBoard[Squares.H1] != Files.FILE_H) {
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
        console.log("\nRanksBoard[SQUARES.A8] = " + RanksBoard[Squares.A8]);
        console.log("FilesBoard[SQUARES.H1] = " + FilesBoard[Squares.H1]);
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
    if (Sq120ToSq64[Squares.A8] != 0 || Sq64ToSq120[63] != Squares.H1) {
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
        for (let rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) {
            for (let file = Files.FILE_A; file <= Files.FILE_H; file++) {
                line += Sq64ToSq120[sq64].toString().padEnd(4);
                sq64++;
            }
            console.log(line);
            line = "   ";
        }
        console.log("\nSq120ToSq64[SQUARES.A8] = " + Sq120ToSq64[Squares.A8] + ", " + "Sq64ToSq120[63] = " + Sq64ToSq120[63]);
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
    if (SqAttacked(Squares.A1, Colours.WHITE)) {
        PrintSqAttackedResults();
        console.log("Position 1/3");
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 1/3");
        PrintSubResult(true);
    }

    ParseFen("r3k2r/8/8/3N4/8/8/8/R3K2R w KQkq - 0 1");
    if (!SqAttacked(GetSquare(Files.FILE_C, Ranks.RANK_7), Colours.WHITE)) {
        PrintSqAttackedResults();
        console.log("Position 2/3");
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 2/3");
        PrintSubResult(true);
    }

    ParseFen("4k3/8/8/3q4/8/8/2B5/4K3 w - - 0 1");
    if (!SqAttacked(GetSquare(Files.FILE_H, Ranks.RANK_1), Colours.BLACK)) {
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
    for (pceType = Pieces.W_PAWN; pceType < Pieces.B_KNIGHT; pceType++) {
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
    for (pceType = Pieces.W_PAWN; pceType < Pieces.B_KNIGHT; pceType++) {
        if (t_numPieces[pceType] != GameBoard.numPieces[pceType]) {
            console.log("Error: GameBoard.numPieces - piece: " + PIECE_CHAR[pceType]);
            return false;
        }
    }
    if (t_material[Colours.WHITE] != GameBoard.material[Colours.WHITE] || t_material[Colours.BLACK] != GameBoard.material[Colours.BLACK]) {
        console.log("Error: GameBoard.material");
        return false;
    }
    if (GameBoard.side != Colours.WHITE && GameBoard.side != Colours.BLACK) {
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