import { GameBoard, ParseFen } from './board.mjs';
import {
    PieceKeys, CastleKeys,
    FilesBoard, RanksBoard,
    Sq64ToSq120, Sq120ToSq64,
    BRD_SQ_NUM, MAXGAMEMOVES, NOMOVE,
    FILES, RANKS, SQUARES, START_FEN,
    FR2SQ, RAND_32
} from './shared/defs.mjs';

export default function Initialize() {
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120ToSq64();
    InitBoardVars();
    ParseFen(START_FEN);

    console.log("Successfully initialized board.");
}

export function InitFilesRanksBrd() {
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

export function InitHashKeys() {
    for (let i = 0; i < 13 * 120; i++) {
        PieceKeys[i] = RAND_32();
    }
    
    for (let i = 0; i < 16; i++) {
        CastleKeys[i] = RAND_32();
    }
}

export function InitSq120ToSq64() { /*this could probably be done better*/ 
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

export function InitBoardVars() {
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