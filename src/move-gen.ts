import { GameBoard, SqAttacked } from "./board";
import { PAWN_START_FLAG, EN_PAS_FLAG, CASTLE_FLAG, Ranks, Pieces, Colours, Squares, CastleBit } from "./shared/constants";
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
    if (RanksBoard[to] == Ranks.RANK_8) {
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.W_QUEEN, 0 ));
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.W_ROOK, 0 ));
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.W_BISHOP, 0 ));
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.W_KNIGHT, 0 ));
    } else {
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.EMPTY, 0 ));
    }
}
export function AddBlackPawnQuietMove(from, to) {
    if (RanksBoard[to] == Ranks.RANK_1) {
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.B_QUEEN, 0 ));
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.B_ROOK, 0 ));
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.B_BISHOP, 0 ));
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.B_KNIGHT, 0 ));
    } else {
        AddQuietMove( MOVE(from, to, Pieces.EMPTY, Pieces.EMPTY, 0 ));
    }
}
export function AddWhitePawnCaptureMove(from, to, cap) {
    if (RanksBoard[to] == Ranks.RANK_8) {
        AddCaptureMove( MOVE(from, to, cap, Pieces.W_QUEEN, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Pieces.W_ROOK, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Pieces.W_BISHOP, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Pieces.W_KNIGHT, 0 ));
    } else {
        AddCaptureMove( MOVE(from, to, cap, Pieces.EMPTY, 0 ));
    }
}
export function AddBlackPawnCaptureMove(from, to, cap) {
    if (RanksBoard[to] == Ranks.RANK_1) {
        AddCaptureMove( MOVE(from, to, cap, Pieces.B_QUEEN, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Pieces.B_ROOK, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Pieces.B_BISHOP, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Pieces.B_KNIGHT, 0 ));
    } else {
        AddCaptureMove( MOVE(from, to, cap, Pieces.EMPTY, 0 ));
    }
}

export function GenerateMoves() { /* doesn't check if moves are illegal yet (specifically for moving into check I think) */
    GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply]; /*ply + 1 is used to add moves and incremented each time a move is added, ply always catches up*/
    
    let pceType;
    let pceNum;
    let sq; /*from square*/
    let pceIndex;
    let t_sq; /*to square*/
    let dir;
    
    /* Side Specific Moves */
    if (GameBoard.side == Colours.WHITE) {
        pceType = Pieces.W_PAWN;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            if (GameBoard.pieces[sq-10] == Pieces.EMPTY) {
                AddWhitePawnQuietMove(sq, sq - 10);
                if (RanksBoard[sq] == Ranks.RANK_2 && GameBoard.pieces[sq-20] == Pieces.EMPTY) {
                     AddQuietMove( MOVE(sq, sq - 20, Pieces.EMPTY, Pieces.EMPTY, PAWN_START_FLAG ));
                }
            }
            
            if (!SqOffboard(sq - 9) && PieceCol[GameBoard.pieces[sq - 9]] == Colours.BLACK) {
                AddWhitePawnCaptureMove( sq, sq - 9, GameBoard.pieces[sq - 9] );
            }
            if (!SqOffboard(sq - 11) && PieceCol[GameBoard.pieces[sq - 11]] == Colours.BLACK) {
                AddWhitePawnCaptureMove( sq, sq - 11, GameBoard.pieces[sq - 11] );
            }
            
            if (GameBoard.enPas != Squares.NO_SQ) {
                if (sq - 9 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq - 9, Pieces.EMPTY, Pieces.EMPTY, EN_PAS_FLAG )); /*make move function will handle the en passant capture*/
                } else if (sq - 11 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq - 11, Pieces.EMPTY, Pieces.EMPTY, EN_PAS_FLAG ));
                }
            }
        }
        
        if (GameBoard.castlePerm & CastleBit.W_KING) {
            if (GameBoard.pieces[Squares.F1] == Pieces.EMPTY && GameBoard.pieces[Squares.G1] == Pieces.EMPTY) {
                if (!SqAttacked(Squares.E1, Colours.BLACK) && SqAttacked(Squares.F1, Colours.BLACK)) {
                    AddQuietMove( MOVE(Squares.E1, Squares.G1, Pieces.EMPTY, Pieces.EMPTY, CASTLE_FLAG ));
                }
            }
        }
        if (GameBoard.castlePerm & CastleBit.W_QUEEN) {
            if (GameBoard.pieces[Squares.B1] == Pieces.EMPTY && GameBoard.pieces[Squares.C1] == Pieces.EMPTY && GameBoard.pieces[Squares.D1] == Pieces.EMPTY) {
                if (!SqAttacked(Squares.E1, Colours.BLACK) && SqAttacked(Squares.D1, Colours.BLACK)) {
                    AddQuietMove( MOVE(Squares.E1, Squares.C1, Pieces.EMPTY, Pieces.EMPTY, CASTLE_FLAG ));
                }
            }
        }
    } else {
        pceType = Pieces.B_PAWN;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            if (GameBoard.pieces[sq + 10] == Pieces.EMPTY) {
                AddBlackPawnQuietMove(sq, sq + 10);
                if (RanksBoard[sq] == Ranks.RANK_7 && GameBoard.pieces[sq + 20] == Pieces.EMPTY) {
                    AddQuietMove( MOVE(sq, sq + 20, Pieces.EMPTY, Pieces.EMPTY, PAWN_START_FLAG) );
                }
            }
            
            if (!SqOffboard(sq + 9) && PieceCol[GameBoard.pieces[sq + 9]] == Colours.WHITE) {
                AddBlackPawnCaptureMove( sq, sq + 9, GameBoard.pieces[sq + 9] );
            }
            if (!SqOffboard(sq + 11) && PieceCol[GameBoard.pieces[sq + 11]] == Colours.WHITE) {
                AddBlackPawnCaptureMove( sq, sq + 11, GameBoard.pieces[sq + 11] );
            }
            
            if (GameBoard.enPas != Squares.NO_SQ) {
                if (sq + 9 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq + 9, Pieces.EMPTY, Pieces.EMPTY, EN_PAS_FLAG ));
                } else if (sq + 11 == GameBoard.enPas) { /*make these both into one or??*/
                    AddEnPassantMove( MOVE(sq, sq + 11, Pieces.EMPTY, Pieces.EMPTY, EN_PAS_FLAG ));
                }
            }
            
        }
        
        if (GameBoard.castlePerm & CastleBit.B_KING) {
            if (GameBoard.pieces[Squares.F8] == Pieces.EMPTY && GameBoard.pieces[Squares.G8] == Pieces.EMPTY) {
                if (!SqAttacked(Squares.E8, Colours.BLACK) && SqAttacked(Squares.F8, Colours.WHITE)) {
                    AddQuietMove( MOVE(Squares.E8, Squares.B8, Pieces.EMPTY, Pieces.EMPTY, CASTLE_FLAG ));
                }
            }
        }
        if (GameBoard.castlePerm & CastleBit.B_QUEEN) {
            if (GameBoard.pieces[Squares.B8] == Pieces.EMPTY && GameBoard.pieces[Squares.C8] == Pieces.EMPTY && GameBoard.pieces[Squares.D8] == Pieces.EMPTY) {
                if (!SqAttacked(Squares.E8, Colours.BLACK) && SqAttacked(Squares.D8, Colours.WHITE)) {
                    AddQuietMove( MOVE(Squares.E8, Squares.C8, Pieces.EMPTY, Pieces.EMPTY, CASTLE_FLAG ));
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
                } else if (GameBoard.pieces[t_sq] == Pieces.EMPTY) {
                    AddQuietMove( MOVE(sq, t_sq, Pieces.EMPTY, Pieces.EMPTY, 0 ));
                } else if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                    AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], Pieces.EMPTY, 0 ));
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
                    if (GameBoard.pieces[t_sq] != Pieces.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                            AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], Pieces.EMPTY, 0 ));
                        }
                        break;
                    }
                    AddQuietMove( MOVE(sq, t_sq, Pieces.EMPTY, Pieces.EMPTY, 0 ));
                    t_sq += dir;
                }
            }
        }
        
        pceType = LoopSlidePce[pceIndex++];
    }
    
}