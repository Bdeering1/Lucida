import { GameBoard, SqAttacked } from "./board";
import { PAWN_START_FLAG, EN_PAS_FLAG, CASTLE_FLAG } from "./shared/constants";
import { RANKS, PIECES, COLOURS, SQUARES, CASTLE_BIT } from "./shared/enums";
import { RanksBoard, PieceIndex, SqOffboard, PieceCol, LoopNonSlideIndex, LoopNonSlidePce, DirNum, PceDir, LoopSlideIndex, LoopSlidePce } from "./shared/utils";


function MOVE(from, to, captured, promoted, flag) {
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

export function AddCaptureMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]++] = 0; /*moveListStart incremented by one right after setting the score*/
}
export function AddQuietMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move; /*there are three of these functions because the scoring will be different for each*/
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]++] = 0;
}
export function AddEnPassantMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]++] = 0;
}

export function AddWhitePawnQuietMove(from, to) {
    if (RanksBoard[to] == RANKS.RANK_8) {
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0 ));
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0 ));
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0 ));
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0 ));
    } else {
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0 ));
    }
}
export function AddBlackPawnQuietMove(from, to) {
    if (RanksBoard[to] == RANKS.RANK_1) {
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0 ));
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0 ));
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0 ));
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0 ));
    } else {
        AddQuietMove( MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0 ));
    }
}
export function AddWhitePawnCaptureMove(from, to, cap) {
    if (RanksBoard[to] == RANKS.RANK_8) {
        AddCaptureMove( MOVE(from, to, cap, PIECES.wQ, 0 ));
        AddCaptureMove( MOVE(from, to, cap, PIECES.wR, 0 ));
        AddCaptureMove( MOVE(from, to, cap, PIECES.wB, 0 ));
        AddCaptureMove( MOVE(from, to, cap, PIECES.wN, 0 ));
    } else {
        AddCaptureMove( MOVE(from, to, cap, PIECES.EMPTY, 0 ));
    }
}
export function AddBlackPawnCaptureMove(from, to, cap) {
    if (RanksBoard[to] == RANKS.RANK_1) {
        AddCaptureMove( MOVE(from, to, cap, PIECES.bQ, 0 ));
        AddCaptureMove( MOVE(from, to, cap, PIECES.bR, 0 ));
        AddCaptureMove( MOVE(from, to, cap, PIECES.bB, 0 ));
        AddCaptureMove( MOVE(from, to, cap, PIECES.bN, 0 ));
    } else {
        AddCaptureMove( MOVE(from, to, cap, PIECES.EMPTY, 0 ));
    }
}

export function GenerateMoves() { /* doesn't check if moves are illegal yet (specifically for moving into check I think) */
    GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply]; /*ply + 1 is used to add moves and incremented each time a move is added, ply always catches up*/
    
    var pceType;
    var pceNum;
    var sq; /*from square*/
    var pceIndex;
    var t_sq; /*to square*/
    var dir;
    
    /* Side Specific Moves */
    if (GameBoard.side == COLOURS.WHITE) {
        pceType = PIECES.wP;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            if (GameBoard.pieces[sq-10] == PIECES.EMPTY) {
                AddWhitePawnQuietMove(sq, sq - 10);
                if (RanksBoard[sq] == RANKS.RANK_2 && GameBoard.pieces[sq-20] == PIECES.EMPTY) {
                     AddQuietMove( MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, PAWN_START_FLAG ));
                }
            }
            
            if (!SqOffboard(sq - 9) && PieceCol[GameBoard.pieces[sq - 9]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove( sq, sq - 9, GameBoard.pieces[sq - 9] );
            }
            if (!SqOffboard(sq - 11) && PieceCol[GameBoard.pieces[sq - 11]] == COLOURS.BLACK) {
                AddWhitePawnCaptureMove( sq, sq - 11, GameBoard.pieces[sq - 11] );
            }
            
            if (GameBoard.enPas != SQUARES.NO_SQ) {
                if (sq - 9 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, EN_PAS_FLAG )); /*make move function will handle the en passant capture*/
                } else if (sq - 11 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, EN_PAS_FLAG ));
                }
            }
        }
        
        if (GameBoard.castlePerm & CASTLE_BIT.WKCA) {
            if (GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] == PIECES.EMPTY) {
                if (!SqAttacked(SQUARES.E1, COLOURS.BLACK) && SqAttacked(SQUARES.F1, COLOURS.BLACK)) {
                    AddQuietMove( MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, CASTLE_FLAG ));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLE_BIT.WQCA) {
            if (GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY) {
                if (!SqAttacked(SQUARES.E1, COLOURS.BLACK) && SqAttacked(SQUARES.D1, COLOURS.BLACK)) {
                    AddQuietMove( MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, CASTLE_FLAG ));
                }
            }
        }
    } else {
        pceType = PIECES.bP;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            if (GameBoard.pieces[sq + 10] == PIECES.EMPTY) {
                AddBlackPawnQuietMove(sq, sq + 10);
                if (RanksBoard[sq] == RANKS.RANK_7 && GameBoard.pieces[sq + 20] == PIECES.EMPTY) {
                    AddQuietMove( MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, PAWN_START_FLAG) );
                }
            }
            
            if (!SqOffboard(sq + 9) && PieceCol[GameBoard.pieces[sq + 9]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove( sq, sq + 9, GameBoard.pieces[sq + 9] );
            }
            if (!SqOffboard(sq + 11) && PieceCol[GameBoard.pieces[sq + 11]] == COLOURS.WHITE) {
                AddBlackPawnCaptureMove( sq, sq + 11, GameBoard.pieces[sq + 11] );
            }
            
            if (GameBoard.enPas != SQUARES.NO_SQ) {
                if (sq + 9 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, EN_PAS_FLAG ));
                } else if (sq + 11 == GameBoard.enPas) { /*make these both into one or??*/
                    AddEnPassantMove( MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, EN_PAS_FLAG ));
                }
            }
            
        }
        
        if (GameBoard.castlePerm & CASTLE_BIT.BKCA) {
            if (GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] == PIECES.EMPTY) {
                if (!SqAttacked(SQUARES.E8, COLOURS.BLACK) && SqAttacked(SQUARES.F8, COLOURS.WHITE)) {
                    AddQuietMove( MOVE(SQUARES.E8, SQUARES.B8, PIECES.EMPTY, PIECES.EMPTY, CASTLE_FLAG ));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLE_BIT.BQCA) {
            if (GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY) {
                if (!SqAttacked(SQUARES.E8, COLOURS.BLACK) && SqAttacked(SQUARES.D8, COLOURS.WHITE)) {
                    AddQuietMove( MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, CASTLE_FLAG ));
                }
            }
        }
    }
    
    /* Non Sliding Pieces */
    pceIndex = LoopNonSlideIndex[GameBoard.side];
    pceType = LoopNonSlidePce[pceIndex++];
    
    while (pceType != 0) {
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            for (let i = 0; i < DirNum[pceType]; i++) {
                dir = PceDir[pceType][i];
                t_sq = sq + dir;
                
                if (SqOffboard(t_sq)) {
                    continue;
                } else if (GameBoard.pieces[t_sq] == PIECES.EMPTY) {
                    AddQuietMove( MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0 ));
                } else if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                    AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
                }
            }
        }
        
        pceType = LoopNonSlidePce[pceIndex++];
    }
    
    /* Sliding Pieces */

    pceIndex = LoopSlideIndex[GameBoard.side];
    pceType = LoopSlidePce[pceIndex++];
    
    while (pceType != 0) {
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            for (let i = 0; i < DirNum[pceType]; i++) {
                dir = PceDir[pceType][i];
                t_sq = sq + dir;
                
                while (!SqOffboard(t_sq)) {
                    if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                            AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
                        }
                        break;
                    }
                    AddQuietMove( MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0 ));
                    t_sq += dir;
                }
            }
        }
        
        pceType = LoopSlidePce[pceIndex++];
    }
    
}