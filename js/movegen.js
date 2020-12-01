function MOVE(from, to, captured, promoted, flag) {
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function GenerateMoves() {
    GameBoard.moveListStart[Gameboard.ply+1] = GameBoard.moveListStart[Gameboard.ply]; /*incremented by one each time a move is generated*/
    
    var pceType;
    var pceNum;
    var sq;
    
    if (Gameboard.side == COLOURS.WHITE) {
        pceType = PIECES.wP;
        
        for (pceNum = 0; pceNum < Gameboard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            
            if (Gamebaord.pieces[sq-10] == PIECES.EMPTY) { /*BlueFever goes in the positive direction???*/
                /*Add pawn move*/
                if (RanksBoard[sq] == RANKS.RANK_2 && GameBoard.pieces[sq-20] == PIECES.EMPTY) { /*is this rank correct????
                                                                                                  *we might need to change our FR2SQ or ParseFen() to make ranks correct*/
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
        
        pceType = PIECES.wN;
    } else {
        pceType = PIECES.bP;
        
                for (pceNum = 0; pceNum < Gameboard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PIECEINDEX(pceType, pceNum)];
            
            if (Gamebaord.pieces[sq + 10] == PIECES.EMPTY) { /*BlueFever goes in the positive direction???*/
                /*Add pawn move*/
                if (RanksBoard[sq] == RANKS.RANK_2 && GameBoard.pieces[sq + 20] == PIECES.EMPTY) { /*is this rank correct???? we might need to change our FR2SQ to make ranks correct*/
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
        
        pceType = PIECES.bN;
    }
    
}