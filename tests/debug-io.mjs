import { PrintBoard, PrintSqAttacked, PrintPieceLists } from '../src/io.mjs';

export const VERBOSE = true;
export const VISUAL = true;

export var isPass = false;

export function PrintResult(pass) {
    pass ? console.log("PASSED\n\n") : console.log("FAILED\n\n");
}

export function PrintSubResult(pass) {
    pass ? console.log(" - passed") : console.log(" - failed");
}

export function UnitTest(test) {
    isPass = false;
    test();
    PrintResult(isPass);
}


export function PrintFenResults(fenNum) {
    console.log("FEN " + fenNum + "/3");
    PrintBoard();
    PrintPieceLists();
}

export function PrintSqAttackedResults() {
    PrintBoard();
    PrintSqAttacked();
}

export function PrintAllMoves() {
    GenerateMoves();
    for (var i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply + 1]; i++) {
        console.log("Move " + (i + 1 - GameBoard.moveListStart[GameBoard.ply]));
        let move = GameBoard.moveList[i];
        console.log(PrMove(move));
        MakeMove(move);
        PrintBoard();
        UndoMove();
    }
    PrintMoveList();
    console.log("Current ply: " + GameBoard.ply);
}