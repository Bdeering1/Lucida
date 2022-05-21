import { GameBoard, SqAttacked } from "./board";
import { PAWN_START_FLAG, EN_PAS_FLAG, CASTLE_FLAG, Rank, Piece, Colour, Square, CastleBit } from "../shared/constants";
import { RanksBoard, PieceIndex, SqOffboard, PieceCol, LoopNonSlideIndex, LoopNonSlidePce, DirNum, PceDir, LoopSlideIndex, LoopSlidePce } from "../shared/utils";


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
    if (RanksBoard[to] == Rank.eight) {
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.whiteQueen, 0 ));
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.whiteRook, 0 ));
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.whiteBishop, 0 ));
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.whiteKnight, 0 ));
    } else {
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.empty, 0 ));
    }
}
export function AddBlackPawnQuietMove(from, to) {
    if (RanksBoard[to] == Rank.one) {
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.blackQueen, 0 ));
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.blackRook, 0 ));
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.blackBishop, 0 ));
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.blackKnight, 0 ));
    } else {
        AddQuietMove( MOVE(from, to, Piece.empty, Piece.empty, 0 ));
    }
}
export function AddWhitePawnCaptureMove(from, to, cap) {
    if (RanksBoard[to] == Rank.eight) {
        AddCaptureMove( MOVE(from, to, cap, Piece.whiteQueen, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Piece.whiteRook, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Piece.whiteBishop, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Piece.whiteKnight, 0 ));
    } else {
        AddCaptureMove( MOVE(from, to, cap, Piece.empty, 0 ));
    }
}
export function AddBlackPawnCaptureMove(from, to, cap) {
    if (RanksBoard[to] == Rank.one) {
        AddCaptureMove( MOVE(from, to, cap, Piece.blackQueen, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Piece.blackRook, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Piece.blackBishop, 0 ));
        AddCaptureMove( MOVE(from, to, cap, Piece.blackKnight, 0 ));
    } else {
        AddCaptureMove( MOVE(from, to, cap, Piece.empty, 0 ));
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
    if (GameBoard.side == Colour.white) {
        pceType = Piece.whitePawn;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            if (GameBoard.pieces[sq-10] == Piece.empty) {
                AddWhitePawnQuietMove(sq, sq - 10);
                if (RanksBoard[sq] == Rank.two && GameBoard.pieces[sq-20] == Piece.empty) {
                     AddQuietMove( MOVE(sq, sq - 20, Piece.empty, Piece.empty, PAWN_START_FLAG ));
                }
            }
            
            if (!SqOffboard(sq - 9) && PieceCol[GameBoard.pieces[sq - 9]] == Colour.black) {
                AddWhitePawnCaptureMove( sq, sq - 9, GameBoard.pieces[sq - 9] );
            }
            if (!SqOffboard(sq - 11) && PieceCol[GameBoard.pieces[sq - 11]] == Colour.black) {
                AddWhitePawnCaptureMove( sq, sq - 11, GameBoard.pieces[sq - 11] );
            }
            
            if (GameBoard.enPas != Square.noSquare) {
                if (sq - 9 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq - 9, Piece.empty, Piece.empty, EN_PAS_FLAG )); /*make move function will handle the en passant capture*/
                } else if (sq - 11 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq - 11, Piece.empty, Piece.empty, EN_PAS_FLAG ));
                }
            }
        }
        
        if (GameBoard.castlePerm & CastleBit.whiteKing) {
            if (GameBoard.pieces[Square.f1] == Piece.empty && GameBoard.pieces[Square.g1] == Piece.empty) {
                if (!SqAttacked(Square.e1, Colour.black) && SqAttacked(Square.f1, Colour.black)) {
                    AddQuietMove( MOVE(Square.e1, Square.g1, Piece.empty, Piece.empty, CASTLE_FLAG ));
                }
            }
        }
        if (GameBoard.castlePerm & CastleBit.whiteQueen) {
            if (GameBoard.pieces[Square.b1] == Piece.empty && GameBoard.pieces[Square.c1] == Piece.empty && GameBoard.pieces[Square.d1] == Piece.empty) {
                if (!SqAttacked(Square.e1, Colour.black) && SqAttacked(Square.d1, Colour.black)) {
                    AddQuietMove( MOVE(Square.e1, Square.c1, Piece.empty, Piece.empty, CASTLE_FLAG ));
                }
            }
        }
    } else {
        pceType = Piece.blackPawn;
        
        for (pceNum = 0; pceNum < GameBoard.numPieces[pceType]; pceNum++) {
            sq = GameBoard.pList[PieceIndex(pceType, pceNum)];
            
            if (GameBoard.pieces[sq + 10] == Piece.empty) {
                AddBlackPawnQuietMove(sq, sq + 10);
                if (RanksBoard[sq] == Rank.seven && GameBoard.pieces[sq + 20] == Piece.empty) {
                    AddQuietMove( MOVE(sq, sq + 20, Piece.empty, Piece.empty, PAWN_START_FLAG) );
                }
            }
            
            if (!SqOffboard(sq + 9) && PieceCol[GameBoard.pieces[sq + 9]] == Colour.white) {
                AddBlackPawnCaptureMove( sq, sq + 9, GameBoard.pieces[sq + 9] );
            }
            if (!SqOffboard(sq + 11) && PieceCol[GameBoard.pieces[sq + 11]] == Colour.white) {
                AddBlackPawnCaptureMove( sq, sq + 11, GameBoard.pieces[sq + 11] );
            }
            
            if (GameBoard.enPas != Square.noSquare) {
                if (sq + 9 == GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq + 9, Piece.empty, Piece.empty, EN_PAS_FLAG ));
                } else if (sq + 11 == GameBoard.enPas) { /*make these both into one or??*/
                    AddEnPassantMove( MOVE(sq, sq + 11, Piece.empty, Piece.empty, EN_PAS_FLAG ));
                }
            }
            
        }
        
        if (GameBoard.castlePerm & CastleBit.blackKing) {
            if (GameBoard.pieces[Square.f8] == Piece.empty && GameBoard.pieces[Square.g8] == Piece.empty) {
                if (!SqAttacked(Square.e8, Colour.black) && SqAttacked(Square.f8, Colour.white)) {
                    AddQuietMove( MOVE(Square.e8, Square.b8, Piece.empty, Piece.empty, CASTLE_FLAG ));
                }
            }
        }
        if (GameBoard.castlePerm & CastleBit.blackQueen) {
            if (GameBoard.pieces[Square.b8] == Piece.empty && GameBoard.pieces[Square.c8] == Piece.empty && GameBoard.pieces[Square.d8] == Piece.empty) {
                if (!SqAttacked(Square.e8, Colour.black) && SqAttacked(Square.d8, Colour.white)) {
                    AddQuietMove( MOVE(Square.e8, Square.c8, Piece.empty, Piece.empty, CASTLE_FLAG ));
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
                } else if (GameBoard.pieces[t_sq] == Piece.empty) {
                    AddQuietMove( MOVE(sq, t_sq, Piece.empty, Piece.empty, 0 ));
                } else if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                    AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], Piece.empty, 0 ));
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
                    if (GameBoard.pieces[t_sq] != Piece.empty) {
                        if (PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
                            AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], Piece.empty, 0 ));
                        }
                        break;
                    }
                    AddQuietMove( MOVE(sq, t_sq, Piece.empty, Piece.empty, 0 ));
                    t_sq += dir;
                }
            }
        }
        
        pceType = LoopSlidePce[pceIndex++];
    }
    
}