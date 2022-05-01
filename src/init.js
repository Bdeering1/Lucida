$(document).ready(function() {
    init();
    ParseFen(START_FEN);
});

function InitFilesRanksBrd() {
    var sq = SQUARES.A1;
    
    for (let i = 0; i < BRD_SQ_NUM; i++) {
        FilesBoard[i] = SQUARES.OFFBOARD;
        RanksBoard[i] = SQUARES.OFFBOARD;
    }
    
    for (let rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file,rank);
            FilesBoard[sq] = file;
            RanksBoard[sq] = rank;
        }
    }
}

function InitHashKeys() {
    for (let i = 0; i < 13 * 120; i++) {
        PieceKeys[i] = RAND_32();
    }

    SideKey = RAND_32(); /* hashed in if white is to move*/
    
    for (let i = 0; i < 16; i++) {
        CastleKeys[i] = RAND_32();
    }
}

function InitSq120ToSq64() { /*this could probably be done better*/ 
    var sq = SQUARES.A1;
    var sq64 = 0;
    
    for (let i = 0; i < BRD_SQ_NUM; i++) {
        Sq120ToSq64[i] = 120;
    }
    
    for (let i = 0; i < 64; i++) {
        Sq64ToSq120[i] = 65;
    }
    
    for (let rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        for (let file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file,rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

function InitBoardVars() {
    for (var i = 0; i < MAXGAMEMOVES; i++) {
        GameBoard.history.push( {
            move : NOMOVE,
            castlePerm : 0,
            enPas : 0,
            fiftyMove : 0,
            posKey : 0
        });
    }
}

function init() {
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120ToSq64();
    InitBoardVars();
}