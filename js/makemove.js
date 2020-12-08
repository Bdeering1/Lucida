function ClearPiece(sq) {
    var pceType = GameBoard.pieces[sq];
    var col = PieceCol[pce];
    var pceNum = -1;
    
    HASH_PIECE(pceType, sq);
    
    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.material[col] -= PieceVal[pceType]; /*faster than using UpdateListsMaterial()*/
    
    for (i = 0; i < 10; i++) { /*maybe if each piece had a unique ID or something this wouldn't be necessary*/
        if (GameBoard.pList[PIECEINDEX(pceType, i)] == sq) {
            pceNum = i;
            break;
        }
    }
    if (pceNum == -1) {
        console.log("PIECE INDEXING ERROR"); 
    }
    GameBoard.numPieces[pceType]--;
    GameBoard.pList[PIECEINDEX(pceType, pceNum)] = GameBoard.pList[PIECEINDEX(pceType, GameBoard.numPieces[pceType])]; /*swap with end of list*/
}


function AddPiece(pceType, sq) {
    var col = PieceCol[pce];
    
    HASH_PIECE(pceType, sq);
    
    GameBoard.pieces[sq] = pceType;
    GameBoard.material[col] += PieceVal[pceType]; /*faster than using UpdateListsMaterial()*/
    GameBoard.pList[PIECEINDEX(pceType, GameBoard.numPieces[pceType]++)] = sq; /*add to end of list*/
}

function MovePiece(pceType, from, to) {
    /*var pceType = GameBoard.pieces[from];*/
    HASH_PIECE(pceType, from);
    HASH_PIECE(pceType, to);
    
    GameBoard.pieces[from] = PIECES.EMPTY;
    GameBoard.pieces[to] = pceType;
    
    for (i = 0; i < GameBoard.numPieces[pceType]; i++) {
        if (GameBoard.pList[PIECEINDEX(pceType, i)] == from) {
            GameBoard.pList[PIECEINDEX(pceType, i)] = to;
            break;
        }
    }
    if (i == -1) {
        console.log("PIECE INDEXING ERROR"); 
    }
}