import { ParseFen, GameBoard } from "../src/board";
import { InitBoardVars } from "../src/initialize";
import { PrintMoveList } from "../src/io";
import { MakeMove, UndoMove } from "../src/make-move";
import { GenerateMoves } from "../src/move-gen";
import { START_FEN } from "../src/shared/constants";
import { SQUARES, PIECES, FILES, RANKS } from "../src/shared/enums";
import { FileRankToSq } from "../src/shared/utils";
import { UnitTest, VERBOSE, PrintFenResults, PrintSubResult, VISUAL } from "./debug-io";
import { InitFilesRanksBrdTest, InitHashKeysTest, InitSq120ToSq64Test, CheckBoard, SqAttackedTest, MoveUndoMoveTest } from "./sub-tests";


console.log("UNIT TESTING\n\n");

// console.log("TEST 1: definitions");
// UnitTest(DefsTest);
console.log("TEST 2: init");
UnitTest(InitTest);
console.log("TEST 3: FEN parsing");
UnitTest(ParseFenTest);
console.log("TEST 4: board intelligence");
UnitTest(BoardIntelTest);
console.log("TEST 5: move generation");
UnitTest(GenerateMovesTest);
console.log("TEST 6: making moves");
UnitTest(MakeMoveTest);

// function DefsTest() {
// 	return def_success;
// }

function InitTest() {
    let isPass = true;

    if (VERBOSE) console.log('InitFilesRanksBrdTest()');
    isPass = InitFilesRanksBrdTest();
    if (VERBOSE) console.log('InitHashKeysTest()');
    isPass = InitHashKeysTest();
    if (VERBOSE) console.log('InitSq120ToSq64Test()');
    isPass = InitSq120ToSq64Test();

    return isPass;
}

function ParseFenTest() {
    let isPass = true;

    ParseFen(START_FEN);
    if (GameBoard.pieces[SQUARES.E8] != PIECES.bK || !CheckBoard()) {
        isPass = false;
        PrintFenResults(1);
    } else if (VERBOSE) {
        console.log("FEN 1/3");
        PrintSubResult(true);
    }
    ParseFen("8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -");
    if (GameBoard.castlePerm != 0 || !CheckBoard()) {
        isPass = false;
        PrintFenResults(2);
    } else if (VERBOSE) {
        console.log("FEN 2/3");
        PrintSubResult(true);
    }
    ParseFen("6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1");
    if (GameBoard.enPas != FileRankToSq(FILES.FILE_D, RANKS.RANK_3) || !CheckBoard()) {
        isPass = false;
    } else {
        if (VISUAL) {
            PrintFenResults(3);
            PrintSubResult(true);
        } else if (VERBOSE) {
            console.log("FEN 3/3");
            PrintSubResult(true);
        }
    }
    return isPass;
}

function BoardIntelTest() {
    return SqAttackedTest();
}

function GenerateMovesTest() {
    let isPass = true;

    ParseFen(START_FEN);
    GenerateMoves();
    if (GameBoard.moveListStart[GameBoard.ply + 1] != 20) {
        console.log("Position 1/3");
        PrintMoveList();
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 1/3");
        PrintSubResult(true);
    }
    ParseFen("6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1");
    GenerateMoves();
    if (GameBoard.moveListStart[GameBoard.ply + 1] != 7) {
        console.log("Position 2/3");
        PrintMoveList();
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 2/3");
        PrintSubResult(true);
    }
    ParseFen("4k3/1q6/8/8/8/8/8/4K3 b - - 0 1");
    GenerateMoves();
    if (GameBoard.moveListStart[GameBoard.ply + 1] != 28) {
        console.log("Position 3/3");
        PrintMoveList();
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 3/3");
        PrintSubResult(true);
    }
    return isPass;
}

function MakeMoveTest() { /*make sure this tests if it catches illegal moves*/
    let isPass = true;

    InitBoardVars();
    ParseFen(START_FEN);
    GenerateMoves();
    MakeMove(GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply]]);
    GenerateMoves();
    if (!MoveUndoMoveTest(1, 15, SQUARES.NO_SQ, 20, 40)) {
        console.log("Test 1/3");
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Test 1/3");
        PrintSubResult(true);
    }
    UndoMove();
    if (!MoveUndoMoveTest(0, 15, SQUARES.NO_SQ, 0, 20)) {
        console.log("Test 2/3");
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Test 2/3");
        PrintSubResult(true);
    }

    ParseFen(START_FEN);
    var numMoves = 400;
    let testMove = 0;
    for (testMove; testMove < numMoves; testMove++) {
        GenerateMoves();
        let move = GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply] + Math.floor(Math.random() * 4)];
        MakeMove(move);
        if (!CheckBoard()) break;
        UndoMove();
        if (!CheckBoard()) break;
        MakeMove(move);
        if (!CheckBoard()) break;
    }
    if (testMove != numMoves) {
        console.log("Test 3/3");
        console.log("iteration " + testMove);
        PrintSubResult(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Test 3/3");
        PrintSubResult(true);
    }
    return isPass;
}