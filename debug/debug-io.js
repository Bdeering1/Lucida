const VERBOSE = true;
const VISUAL = true;

var isPass = false;

function RESULT(pass) {
    pass ? console.log("PASSED\n\n") : console.log("FAILED\n\n");
}

function SUBRESULT(pass) {
    pass ? console.log(" - passed") : console.log(" - failed");
}

function UnitTest(test) {
    isPass = false;
    test();
    RESULT(isPass);
}


function PrintFenResults(fenNum) {
    console.log("FEN " + fenNum + "/3");
    PrintBoard();
    PrintPieceLists();
}

function PrintSqAttackedResults() {
    PrintBoard();
    PrintSqAttacked();
}

function PrintAllMoves(fen) {
    ParseFen(fen);
    GenerateMoves();
    for (moveNum = 0; moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; moveNum++) {
        console.log("Move " + (moveNum + 1));
        MakeMove(GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply] + moveNum]);
        PrintBoard();
        /*UndoMove();*/
        ParseFen(fen); /*undo move eventually*/
    }
}