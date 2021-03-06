/*INIT TESTS*/

function InitFilesRanksBrdTest() {
    InitFilesRanksBrd();
    if (RanksBoard[SQUARES.A8] != RANKS.RANK_8 || FilesBoard[SQUARES.H1] != FILES.FILE_H) {
        var line = "   ";
        console.log("FilesBoard");
        for (i = 0; i < BRD_SQ_NUM; i++) {
            line += FilesBoard[i].toString().padEnd(4);
            if ((i + 1) % 10 === 0) {
                console.log(line);
                line = "   ";
            }
        }
        console.log("RanksBoard");
        for (i = 0; i < BRD_SQ_NUM; i++) {
            line += RanksBoard[i].toString().padEnd(4);
            if ((i + 1) % 10 === 0) {
                console.log(line);
                line = "   ";
            }
        }
        console.log("\nRanksBoard[SQUARES.A8] = " + RanksBoard[SQUARES.A8]);
        console.log("FilesBoard[SQUARES.H1] = " + FilesBoard[SQUARES.H1]);
        SUBRESULT(false);
        isPass = false;
    } else if (VERBOSE) {
        SUBRESULT(true);
    }
}

function InitHashKeysTest() {
    InitHashKeys();
    if (PieceKeys[13 * 120 - 1] == null) {
        SUBRESULT(false);
        isPass = false;
    } else if (VERBOSE) {
        SUBRESULT(true);
    }
}

function InitSq120ToSq64Test() {
    InitSq120ToSq64();
    if (Sq120ToSq64[SQUARES.A8] != 0 || Sq64ToSq120[63] != SQUARES.H1) {
        var sq64 = 0;
        var line = "   ";
        console.log("Sq120ToSq64");
        for (sq = 0; sq < BRD_SQ_NUM; sq++) {
            line += Sq120ToSq64[sq].toString().padEnd(4);
            if ((sq + 1) % 10 == 0) {
                console.log(line);
                line = "   ";
            }
        }
        console.log("Sq64ToSq120");
        for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
            for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
                line += Sq64ToSq120[sq64].toString().padEnd(4);
                sq64++;
            }
            console.log(line);
            line = "   ";
        }
        console.log("\nSq120ToSq64[SQUARES.A8] = " + Sq120ToSq64[SQUARES.A8] + ", " + "Sq64ToSq120[63] = " + Sq64ToSq120[63]);
        SUBRESULT(false);
        isPass = false;
    } else if (VERBOSE) {
        SUBRESULT(true);
    }
}

/*BOARD INTELLIGENCE TESTS (*/

function SqAttackedTest() {
    ParseFen(START_FEN);
    if (SqAttacked(SQUARES.A1, COLOURS.WHITE)) {
        PrintSqAttackedResults();
        console.log("Position 1/3");
        SUBRESULT(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 1/3");
        SUBRESULT(true);
    }

    ParseFen("r3k2r/8/8/3N4/8/8/8/R3K2R w KQkq - 0 1");
    if (!SqAttacked(FR2SQ(FILES.FILE_C, RANKS.RANK_7), COLOURS.WHITE)) {
        PrintSqAttackedResults();
        console.log("Position 2/3");
        SUBRESULT(false);
        isPass = false;
    } else if (VERBOSE) {
        console.log("Position 2/3");
        SUBRESULT(true);
    }

    ParseFen("4k3/8/8/3q4/8/8/2B5/4K3 w - - 0 1");
    if (!SqAttacked(FR2SQ(FILES.FILE_H, RANKS.RANK_1), COLOURS.BLACK)) {
        PrintSqAttackedResults();
        console.log("Position 3/3");
        SUBRESULT(false);
        isPass = false;
    } else {
        if (VISUAL) {
            PrintSqAttackedResults();
        }
        if (VERBOSE) {
            console.log("Position 3/3");
            SUBRESULT(true);
        }
    }
}

/*UTILITY TESTS*/

function CheckBoard() { /*check what col and pcount were supposed to be for*/
    var t_numPieces = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var t_material = [0, 0];
    var sq64, sq120, pceType, pceNum, col, pcount;

    /*checking pList against pieces*/
    for (pceType = PIECES.wP; pceType < PIECES.bK; pceType++) {
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq120 = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            if (GameBoard.pieces[sq120] != pceType) {
                console.log("Error: GameBoard.pList - piece: " + PieceChar[pceType]);
                return false;
            }
        }
    }
    /*checking numPieces and material against pieces*/
    for (sq64 = 0; sq64 < 64; sq64++) {
        sq120 = SQ120(sq64);
        pceType = GameBoard.pieces[sq120];
        t_numPieces[pceType]++;
        t_material[PieceCol[pceType]] += PieceVal[pceType];
    }
    for (pceType = PIECES.wP; pceType < PIECES.bK; pceType++) {
        if (t_numPieces[pceType] != GameBoard.numPieces[pceType]) {
            console.log("Error: GameBoard.numPieces - piece: " + PieceChar[pceType]);
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