function ClearPiece(sq) {
    var pceType = GameBoard.pieces[sq];
    if (pceType == PIECES.EMPTY) {
        console.log("Error: trying to clear empty piece");
        return;
    }

    var col = PieceCol[pceType];
    var pceNum = -1;

    HASH_PIECE(pceType, sq);

    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.material[col] -= PieceVal[pceType];

    for (var i = 0; i < GameBoard.numPieces[pceType]; i++) { /*maybe if each piece had a unique ID or something this wouldn't be necessary*/
        if (GameBoard.pList[PIECEINDEX(pceType, i)] == sq) {
            pceNum = i;
            break;
        }
    }
    if (pceNum == -1) {
        console.log("Error: could not find piece to clear");
    }
    GameBoard.numPieces[pceType]--;
    GameBoard.pList[PIECEINDEX(pceType, pceNum)] = GameBoard.pList[PIECEINDEX(pceType, GameBoard.numPieces[pceType])]; /*swap with end of list (after decrementing numPieces)*/
}


function AddPiece(pceType, sq) {
    if (pceType > 13) {
        console.log("Error: pceType = " + pceType);
    }

    var col = PieceCol[pceType];

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

    for (var i = 0; i < GameBoard.numPieces[pceType]; i++) {
        if (GameBoard.pList[PIECEINDEX(pceType, i)] == from) { /*trying to find the 'ID' of the piece*/
            GameBoard.pList[PIECEINDEX(pceType, i)] = to;
            break;
        }
    }
    if (i == -1) {
        console.log("Error: could not find piece");
    }
}

function MakeMove(move) {
    if (move == null) {
        console.log("Error: empty move");
        return false;
    }

    var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = GameBoard.side;
    if (side == COLOURS.BOTH) {
        console.log("Error: FEN parsing - side: BOTH");
        return false;
    }

    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;
    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    if (GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    GameBoard.enPas = SQUARES.NO_SQ;

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
        HASH_CA();
        GameBoard.castlePerm &= CastlePerm[from];
        HASH_CA();
    } else if ((GameBoard.castlePerm & 15) != 0) { /*if castlePerm is still non zero (there are possible castlePerm changes)*/
        HASH_CA();
        GameBoard.castlePerm &= CastlePerm[from];
        GameBoard.castlePerm &= CastlePerm[to]; /*just in case a rook is captured*/
        HASH_CA();
    } /*if there are no possible castlePerm changes castlePerm is not touched and not hashed in or out*/

    GameBoard.fiftyMove++;
    if (CAPTURED(move) != PIECES.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    if (PiecePawn[GameBoard.pieces[from]]) {
        GameBoard.fiftyMove = 0;
        if ((move & MFLAGPS) != 0) {
            if (GameBoard.side == COLOURS.WHITE) {
                GameBoard.enPas = from - 10;
            } else {
                GameBoard.enPas = from + 10;
            }
            HASH_EP();
        }
    }
    GameBoard.hisPly++;
    GameBoard.ply++;

    MovePiece(from, to);
    promoted = PROMOTED(move);
    if (promoted != PIECES.EMPTY) {
        ClearPiece(to);
        AddPiece(promoted, to);
    }

    GameBoard.side ^= 1;
    HASH_SIDE();

    if (SqAttacked(GameBoard.pList[PIECEINDEX(Kings[side], 0)], GameBoard.side)) {
        UndoMove();
        return false;
    }
    return true;
}

function UndoMove() {
    GameBoard.hisPly--;
    GameBoard.ply--;

    var move = GameBoard.history[GameBoard.hisPly].move;
    var from = FROMSQ(move);
    var to = TOSQ(move);

    if (GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;

    if (GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    GameBoard.side ^= 1;
    HASH_SIDE();

    if ((move & MFLAGEP) != 0) {
        if (GameBoard.side == COLOURS.WHITE) {
            AddPiece(PIECES.bP, to + 10);
        } else {
            AddPiece(PIECES.wP, to - 10);
        }
    } else if ((move & MFLAGCA) != 0) {
        switch (to) {
            case SQUARES.C1:
                MovePiece(SQUARES.D1, SQUARES.A1);
                break;
            case SQUARES.G1:
                MovePiece(SQUARES.F1, SQUARES.H1);
                break;
            case SQUARES.C8:
                MovePiece(SQUARES.D8, SQUARES.A8);
                break;
            case SQUARES.G8:
                MovePiece(SQUARES.F8, SQUARES.H8);
                break;
            default:
                console.log("Error: could not undo castle");
                break;
        }
    }

    MovePiece(to, from);

    captured = CAPTURED(move);
    if (captured != PIECES.EMPTY) {
        AddPiece(captured, to);
    }
    if (PROMOTED(move) != PIECES.EMPTY) {
        ClearPiece(from);
        AddPiece((GameBoard.side == COLOURS.WHITE ? PIECES.wP : PIECES.bP), from);
    }
}