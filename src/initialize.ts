import { GameBoard, ParseFen } from './board/board.js';
import { START_FEN, BRD_SQ_NUM, MAX_GAME_MOVES, NO_MOVE, File, Rank, Square } from './shared/constants.js';
import { FilesBoard, RanksBoard, GetSquare, PieceKeys, Rand32, CastleKeys, Sq120ToSq64, Sq64ToSq120 } from './shared/utils.js';

export default function Initialize() {
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120ToSq64();
    InitBoardVars();
    ParseFen(START_FEN);
}

export function InitFilesRanksBrd() {
    let sq = Square.a1;
    
    for (let i = 0; i < BRD_SQ_NUM; i++) {
        FilesBoard[i] = Square.offBoard;
        RanksBoard[i] = Square.offBoard;
    }
    
    for (let rank = Rank.one; rank <= Rank.eight; rank++) {
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file,rank);
            FilesBoard[sq] = file;
            RanksBoard[sq] = rank;
        }
    }
}

export function InitHashKeys() {
    for (let i = 0; i < 13 * 120; i++) {
        PieceKeys[i] = Rand32();
    }
    
    for (let i = 0; i < 16; i++) {
        CastleKeys[i] = Rand32();
    }
}

export function InitSq120ToSq64() { /*this could probably be done better*/ 
    let sq = Square.a1;
    let sq64 = 0;
    
    for (let i = 0; i < BRD_SQ_NUM; i++) {
        Sq120ToSq64[i] = 120;
    }
    
    for (let i = 0; i < 64; i++) {
        Sq64ToSq120[i] = 65;
    }
    
    for (let rank = Rank.eight; rank >= Rank.one; rank--) {
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file,rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

export function InitBoardVars() { /* 'ResetBoardHistory' woudl probably be more accurate */
    for (let i = 0; i < MAX_GAME_MOVES; i++) {
        GameBoard.history.push( {
            move : NO_MOVE,
            castlePerm : 0,
            enPas : 0,
            fiftyMove : 0,
            posKey : 0
        });
    }
}