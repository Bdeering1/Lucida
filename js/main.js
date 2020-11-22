$(function() {
    init();
    console.log("Main Init Called");
    
    ParseFen(START_FEN);
    PrintBoard();
});

function InitFilesRanksBrd() {
    
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    
    for (i= 0; i < BRD_SQ_NUM; i++) {
        FilesBoard[i] = SQUARES.OFFBOARD;
        RanksBoard[i] = SQUARES.OFFBOARD;
    }
    
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file,rank);
            FilesBoard[sq] = file;
            RanksBoard[sq] = rank;
        }
    }
    
    console.log("FilesBoard[0]: " + FilesBoard[0] + " RanksBoard[0]: " + RanksBoard[0]);
    console.log("FilesBoard[SQUARES.A1]: " + FilesBoard[SQUARES.A1] + " RanksBoard[SQUARES.A1]: " + RanksBoard[SQUARES.A1]);
    console.log("FilesBoard[SQUARES.E8]: " + FilesBoard[SQUARES.E8] + " RanksBoard[SQUARES.E8]: " + RanksBoard[SQUARES.E8]);
    
}

function InitHashKeys() {
    var index = 0;
    
    for (i = 0; i < 14 * 120; i++) {
        PieceKeys[i] = RAND_32();
    }

    SideKey = RAND_32(); /* hashed in if white is to move*/
    
    for (i = 0; i < 16; i++) {
        CastleKeys[i] = RAND_32();
    }
}

function InitSq120ToSq64() { /*this could probably be done better*/ 
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;
    
    for (i = 0; i < BRD_SQ_NUM; i++) {
        Sq120ToSq64[i] = 120;
    }
    
    for (i = 0; i < 64; i++) {
        Sq64ToSq120[i] = 65; /*changed from 65 in original*/
    }
    
    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank ++) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file,rank);
            Sq120ToSq64[sq] = sq64;
            Sq64ToSq120[sq64] = sq;
            sq64++;
        }
    }
}

function init() {
    console.log("init() called");
    InitFilesRanksBrd();
    InitHashKeys();
    InitFilesRanksBrd();
}