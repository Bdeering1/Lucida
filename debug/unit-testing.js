$(document).ready(function() {
    console.log("UNIT TESTING\n\n");

    console.log("TEST 1: definitions");
    UnitTest(DefsTest);
    console.log("TEST 2: init");
    UnitTest(InitTest);
    console.log("TEST 3: FEN parsing");
    UnitTest(ParseFenTest);
    console.log("TEST 4: board intelligence");
    UnitTest(BoardIntelTest);
    console.log("TEST 5: move generation");
    UnitTest(GenerateMovesTest);
});

function DefsTest() {
    def_success == 1 ? isPass = true : isPass = false; /*add for multiple def files later*/
}

function InitTest() {
    isPass = true;

    VERBOSE ? console.log("InitFilesRanksBrdTest()") : true;
    InitFilesRanksBrdTest();
    VERBOSE ? console.log("InitHashKeysTest()") : true;
    InitHashKeysTest();
    VERBOSE ? console.log("InitSq120ToSq64Test()") : true;
    InitSq120ToSq64Test();
}

function ParseFenTest() {
    isPass = true;

    ParseFen(START_FEN);
    if (GameBoard.pieces[SQUARES.E8] != PIECES.bK) {
        isPass = false;
        PrintFenResults(1);
    }
    ParseFen("8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -");
    if (GameBoard.castlePerm != 0) {
        isPass = false;
        PrintFenResults(2);
    }
    ParseFen("6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1");
    if (GameBoard.enPas != FR2SQ(FILES.FILE_D, RANKS.RANK_3)) {
        isPass = false;
    }!isPass || VISUAL ? PrintFenResults(3) : true;
}

function BoardIntelTest() {
    isPass = true;

    SqAttackedTest();
}

function GenerateMovesTest() {
    isPass = true;

    ParseFen(START_FEN);
    GenerateMoves();
    if (GameBoard.moveListStart[GameBoard.ply + 1] != 20) {
        console.log("Position 1/3");
        PrintMoveList();
        SUBRESULT(false);
    } else if (VERBOSE) {
        console.log("Position 1/3");
        SUBRESULT(true);
    }
    ParseFen("6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1");
    GenerateMoves();
    if (GameBoard.moveListStart[GameBoard.ply + 1] != 7) {
        console.log("Position 2/3");
        PrintMoveList();
        SUBRESULT(false);
    } else if (VERBOSE) {
        console.log("Position 2/3");
        SUBRESULT(true);
    }
    ParseFen("4k3/1q6/8/8/8/8/8/4K3 b - - 0 1");
    GenerateMoves();
    if (GameBoard.moveListStart[GameBoard.ply + 1] != 28) {
        console.log("Position 3/3");
        PrintMoveList();
        SUBRESULT(false);
    } else if (VERBOSE) {
        console.log("Position 3/3");
        SUBRESULT(true);
    }
}