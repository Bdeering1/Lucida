$(document).ready(function() {
    console.log("UNIT TESTING\n\n");

    console.log("TEST 1: definitions");
    UnitTest(DefsTest);
    console.log("TEST 2: init"); /*add InitBoardVars() to this*/
    UnitTest(InitTest);
    console.log("TEST 3: FEN parsing");
    UnitTest(ParseFenTest);
    console.log("TEST 4: board intelligence");
    UnitTest(BoardIntelTest);
    console.log("TEST 5: move generation");
    UnitTest(GenerateMovesTest);
    console.log("TEST 6: making moves");
    UnitTest(MakeMoveTest);
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
    /*Test InitBoardVars() here*/
}

function ParseFenTest() {
    isPass = true;

    ParseFen(START_FEN);
    if (GameBoard.pieces[SQUARES.E8] != PIECES.bK || !CheckBoard()) {
        isPass = false;
        PrintFenResults(1);
    } else if (VERBOSE) {
        console.log("FEN 1/3");
        SUBRESULT(true);
    }
    ParseFen("8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -");
    if (GameBoard.castlePerm != 0 || !CheckBoard()) {
        isPass = false;
        PrintFenResults(2);
    } else if (VERBOSE) {
        console.log("FEN 2/3");
        SUBRESULT(true);
    }
    ParseFen("6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1");
    if (GameBoard.enPas != FR2SQ(FILES.FILE_D, RANKS.RANK_3) || !CheckBoard()) {
        isPass = false;
    } else {
        if (VISUAL) {
            PrintFenResults(3);
            SUBRESULT(true);
        } else if (VERBOSE) {
            console.log("FEN 3/3");
            SUBRESULT(true);
        }
    }
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
        isPass = false;
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
        isPass = false;
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
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 3/3");
        SUBRESULT(true);
    }
}

function MakeMoveTest() { /*make sure this tests if it catches illegal moves*/
    isPass = true;

    ParseFen(START_FEN);
    GenerateMoves();
    if (!MakeMove(GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1] - 1]) || !CheckBoard()) {
        console.log("Test 1/2");
        PrintBoard();
        SUBRESULT(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Test 1/2");
        SUBRESULT(true);
    }

    ParseFen("6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1");
    GenerateMoves();
    if (!MakeMove(GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply] + 1]) || !CheckBoard()) {
        PrintBoard();
        console.log("Test 2/2");
        SUBRESULT(false);
        isPass = false;
    } else {
        if (VISUAL) {
            PrintBoard();
        }
        if (VERBOSE) {
            console.log("Test 2/2");
            SUBRESULT(true);
        }
    }
}