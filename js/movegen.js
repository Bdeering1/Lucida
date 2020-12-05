function MOVE(from, to, captured, promoted, flag) {
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function GenerateMoves() {
    GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply]; /*incremented by one each time a move is generated*/
    
    var pceType;
    var pceNum;
    var sq;
    var pceIndex;
    var t_sq;
    var dir;
    
    /* Side Specific Moves */
    if (GameBoard.side == COLOURS.WHITE) {
        pceType = PIECES.wP;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            
            if (GameBoard.pieces[sq-10] == PIECES.EMPTY) {
                /*Add pawn move*/
                if (RanksBoard[sq] == RANKS.RANK_2 && GameBoard.pieces[sq-20] == PIECES.EMPTY) {
                    /*Add quiet move*/
                }
            }
            
            if (PieceCol[GameBoard.pieces[sq - 9]] == COLOURS.BLACK) {
                /*Add pawn capture move*/
            }
            if (PieceCol[GameBoard.pieces[sq - 11]] == COLOURS.BLACK) {
                /*Add pawn capture move*/
            }
            
            if (GameBoard.enPas != SQUARES.NOSQ) {
                if (sq - 9 == GameBoard.enPas) {
                    /*Add enPas move*/
                }
                if (sq - 11 == GameBoard.enPas) { /*make these both into one or??*/
                    /*Add enPas move*/
                }
            }
        }
        
        if (GameBoard.castlePerm & CASTLEBIT.WKCA) {
            if (GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.E1, COLOURS.BLACK) == false && SqAttacked(SQUARES.F1, COLOURS.BLACK)) {
                    /*Add quiet move*/
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.WQCA) {
            if (GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.E1, COLOURS.BLACK) == false && SqAttacked(SQUARES.D1, COLOURS.BLACK)) {
                    /*Add quiet move*/
                }
            }
        }
    } else {
        pceType = PIECES.bP;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            
            if (GameBoard.pieces[sq + 10] == PIECES.EMPTY) { /*BlueFever goes in the positive direction???*/
                /*Add pawn move*/
                if (RanksBoard[sq] == RANKS.RANK_7 && GameBoard.pieces[sq + 20] == PIECES.EMPTY) { /*is this rank correct???? we might need to change our FR2SQ to make ranks correct*/
                    /*Add quiet move*/
                }
            }
            
            if (PieceCol[GameBoard.pieces[sq + 9]] == COLOURS.WHITE) {
                /*Add pawn capture move*/
            }
            if (PieceCol[GameBoard.pieces[sq + 11]] == COLOURS.WHITE) {
                /*Add pawn capture move*/
            }
            
            if (GameBoard.enPas != SQUARES.NOSQ) {
                if (sq + 9 == GameBoard.enPas) {
                    /*Add enPas move*/
                }
                if (sq + 11 == GameBoard.enPas) { /*make these both into one or??*/
                    /*Add enPas move*/
                }
            }
            
        }
        
        if (GameBoard.castlePerm & CASTLEBIT.BKCA) {
            if (GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.E8, COLOURS.BLACK) == false && SqAttacked(SQUARES.F8, COLOURS.WHITE)) {
                    /*Add quiet move*/
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.BQCA) {
            if (GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY) {
                if (SqAttacked(SQUARES.E8, COLOURS.BLACK) == false && SqAttacked(SQUARES.D8, COLOURS.WHITE)) {
                    /*Add quiet move*/
                }
            }
        }
    }
    
    /* Non Sliding Pieces */
    pceIndex = LoopNonSlideIndex[GameBoard.side];
    pceType = LoopNonSlidePce[pceIndex++];
    
    while (pceType != 0) {
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            
            for (i = 0; i < DirNum[pceType]; i++) {
                dir = PceDir[pceType][i];
                t_sq = sq + dir;
                
                if (SQOFFBOARD(t_sq)) {
                    continue;
                } else if (GameBoard.pieces[t_sq] == PIECES.EMPTY) {
                    /*Add quiet move*/
                } else if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                    /*Add capture move*/
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
            sq = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            
            for (i = 0; i < DirNum[pceType]; i++) {
                dir = PceDir[pceType][i];
                t_sq = sq + dir;
                
                while (SQOFFBOARD(t_sq) == false) {
                    if (GameBoard.pieces[t_sq] != PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                            /*Add capture move*/
                        }
                        break;
                    }
                    /*Add quiet move*/
                    t_sq += dir;
                }
            }
        }
        
        pceType = LoopSlidePce[pceIndex++];
    }
    
}