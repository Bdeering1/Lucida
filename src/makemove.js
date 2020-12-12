function ClearPiece(sq) {
    var pceType = GameBoard.pieces[sq];
    var col = PieceCol[pce];
    var pceNum = -1;
    
    HASH_PIECE(pceType, sq);
    
    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.material[col] -= PieceVal[pceType];
    
    for (i = 0; i < GameBoard.numPieces[pceType]; i++) { /*maybe if each piece had a unique ID or something this wouldn't be necessary*/
        if (GameBoard.pList[PIECEINDEX(pceType, i)] == sq) {
            pceNum = i;
            break;
        }
    }
    if (pceNum == -1) {
        console.log("PIECE INDEXING ERROR"); 
    }
    GameBoard.numPieces[pceType]--;
    GameBoard.pList[PIECEINDEX(pceType, pceNum)] = GameBoard.pList[PIECEINDEX(pceType, GameBoard.numPieces[pceType])]; /*swap with end of list (after decrementing numPieces)*/
}


function AddPiece(pceType, sq) {
    var col = PieceCol[pce];
    
    HASH_PIECE(pceType, sq);
    
    GameBoard.pieces[sq] = pceType;
    GameBoard.material[col] += PieceVal[pceType];
    GameBoard.pList[PIECEINDEX(pceType, GameBoard.numPieces[pceType]++)] = sq; /*add to end of list*/
}

function MovePiece(from, to) { /*make sure this is right*/
    var pceType = GameBoard.pieces[from];
    HASH_PIECE(pceType, from);
    HASH_PIECE(pceType, to);
    
    GameBoard.pieces[from] = PIECES.EMPTY;
    GameBoard.pieces[to] = pceType;
    
    for (i = 0; i < GameBoard.numPieces[pceType]; i++) {
        if (GameBoard.pList[PIECEINDEX(pceType, i)] == from) { /*trying to find the 'ID' of the piece*/
            GameBoard.pList[PIECEINDEX(pceType, i)] = to;
            break;
        }
    }
    if (i == -1) {
        console.log("PIECE INDEXING ERROR"); 
    }
}

function MakeMove(move) {
    var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = GameBoard.side;
    
    Gameboard.history[GameBoard.plyNum].posKey = GameBoard.posKey;
    
    if ((move & MFLAGEP) != 0) {
        if (side == COLOURS.WHITE) {
            ClearPiece(to + 10);
        } else {
            ClearPiece(to - 10);
        }
    } else if ((move & MFLAGCA) != 0) {
        switch (to) {
            case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
                break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
                break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
                break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
                break;
            default:
                console.log("Error: invalid castle move");
                break;
        }
    }
    
    if (GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    
    GameBoard.history[GameBoard.plyNum].move = move;
    GameBoard.history[GameBoard.plyNum].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.plyNum].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.plyNum].castlePerm = GameBoard.castlePerm;
    
}
















