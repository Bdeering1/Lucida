import { BOARD_SQ_NUM, INNER_BOARD_SQ_NUM, MAX_GAME_MOVES, NO_MOVE, NUM_PIECE_TYPES, START_FEN } from '../shared/constants.js';
import { BoardUtils, GetSquare, Rand32 } from '../shared/utils.js';
import { File, Rank, Square } from '../shared/enums.js';
import { GameBoard, ParseFen } from './board_old.js';

export default function Initialize() {
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120ToSq64();
    InitBoardVars();
    ParseFen(START_FEN);
}


function InitFilesRanksBrd() {
    let sq = Square.a1;

    for (let i = 0; i < BOARD_SQ_NUM; i++) {
        BoardUtils.FilesBoard[i] = Square.offBoard;
        BoardUtils.RanksBoard[i] = Square.offBoard;
    }

    for (let rank = Rank.one; rank <= Rank.eight; rank++) {
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file,rank);
            BoardUtils.FilesBoard[sq] = file;
            BoardUtils.RanksBoard[sq] = rank;
        }
    }
}

function InitHashKeys() {
    for (let i = 0; i < NUM_PIECE_TYPES * BOARD_SQ_NUM; i++) {
        BoardUtils.PieceKeys[i] = Rand32();
    }

    for (let i = 0; i < 16; i++) {
        BoardUtils.CastleKeys[i] = Rand32();
    }
}

function InitSq120ToSq64() { /*this could probably be done better*/ 
    let sq = Square.a1;
    let sq64 = 0;
    
    for (let i = 0; i < BOARD_SQ_NUM; i++) {
        BoardUtils.Sq120ToSq64[i] = BOARD_SQ_NUM;
    }
    
    for (let i = 0; i < INNER_BOARD_SQ_NUM; i++) {
        BoardUtils.Sq64ToSq120[i] = INNER_BOARD_SQ_NUM + 1;
    }
    
    for (let rank = Rank.eight; rank >= Rank.one; rank--) {
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file,rank);
            BoardUtils.Sq64ToSq120[sq64] = sq;
            BoardUtils.Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

function InitBoardVars() { /* 'ResetBoardHistory' woudl probably be more accurate */
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