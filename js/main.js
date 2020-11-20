$(function() {
    init();
    console.log("Main Init Called"); 
});

function InitFilesRanksBrd() {
    
    var index = 0;
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

function init() {
    console.log("init() called");
    InitFilesRanksBrd();
}