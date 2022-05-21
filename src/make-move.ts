import { GameBoard, HashPiece, HashEnPas, HashCastle, HashSide, SqAttacked } from "./board";
import { EN_PAS_FLAG, CASTLE_FLAG, PAWN_START_FLAG, Pieces, Colours, Squares } from "./shared/constants";
import { PieceCol, PieceVal, PieceIndex, FromSq, ToSq, CastlePerm, Captured, PiecePawn, Promoted, Kings } from "./shared/utils";


export function ClearPiece(sq) {
    let pceType = GameBoard.pieces[sq];
    if (pceType == Pieces.EMPTY) {
        console.log("Error: trying to clear empty piece");
        return;
    }

    let col = PieceCol[pceType];
    let pceNum = -1;

    HashPiece(pceType, sq);

    GameBoard.pieces[sq] = Pieces.EMPTY;
    GameBoard.material[col] -= PieceVal[pceType];

    for (let i = 0; i < GameBoard.numPieces[pceType]; i++) { /*maybe if each piece had a unique ID or something this wouldn't be necessary*/
        if (GameBoard.pList[PieceIndex(pceType, i)] == sq) {
            pceNum = i;
            break;
        }
    }
    if (pceNum == -1) {
        console.log("Error: could not find piece to clear");
    }
    GameBoard.numPieces[pceType]--;
    GameBoard.pList[PieceIndex(pceType, pceNum)] = GameBoard.pList[PieceIndex(pceType, GameBoard.numPieces[pceType])]; /*swap with end of list (after decrementing numPieces)*/
}


export function AddPiece(pceType, sq) {
    if (pceType > 13) {
        console.log("Error: pceType = " + pceType);
    }

    let col = PieceCol[pceType];

    HashPiece(pceType, sq);

    GameBoard.pieces[sq] = pceType;
    GameBoard.material[col] += PieceVal[pceType];
    GameBoard.pList[PieceIndex(pceType, GameBoard.numPieces[pceType]++)] = sq; /*add to end of list*/
}

export function MovePiece(from, to) { /*make sure this is right*/
    let pceType = GameBoard.pieces[from];
    HashPiece(pceType, from);
    HashPiece(pceType, to);

    GameBoard.pieces[from] = Pieces.EMPTY;
    GameBoard.pieces[to] = pceType;

    let i = 0;
    for (i; i < GameBoard.numPieces[pceType]; i++) {
        if (GameBoard.pList[PieceIndex(pceType, i)] == from) { /*trying to find the 'ID' of the piece*/
            GameBoard.pList[PieceIndex(pceType, i)] = to;
            break;
        }
    }
    if (i == GameBoard.numPieces[pceType]) {
        console.log("Error: could not find piece");
    }
}

export function MakeMove(move) {
    if (move == null) {
        console.log("Error: empty move");
        return false;
    }

    var from = FromSq(move);
    var to = ToSq(move);
    var side = GameBoard.side;
    if (side == Colours.BOTH) {
        console.log("Error: FEN parsing - side: BOTH");
        return false;
    }

    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;
    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    if (GameBoard.enPas != Squares.NO_SQ) HashEnPas();
    GameBoard.enPas = Squares.NO_SQ;

    if ((move & EN_PAS_FLAG) != 0) {
        if (side == Colours.WHITE) {
            ClearPiece(to + 10);
        } else {
            ClearPiece(to - 10);
        }
    } else if ((move & CASTLE_FLAG) != 0) {
        switch (to) {
            case Squares.C1:
                MovePiece(Squares.A1, Squares.D1);
                break;
            case Squares.G1:
                MovePiece(Squares.H1, Squares.F1);
                break;
            case Squares.C8:
                MovePiece(Squares.A8, Squares.D8);
                break;
            case Squares.G8:
                MovePiece(Squares.H8, Squares.F8);
                break;
            default:
                console.log("Error: invalid castle move");
                break;
        }
        HashCastle();
        GameBoard.castlePerm &= CastlePerm[from];
        HashCastle();
    } else if ((GameBoard.castlePerm & 15) != 0) { /*if there are still possible castlePerm changes*/
        HashCastle();
        GameBoard.castlePerm &= CastlePerm[from];
        GameBoard.castlePerm &= CastlePerm[to]; /*in case a rook is captured*/
        HashCastle();
    } /*if there are no possible castlePerm changes castlePerm is not touched and not hashed in or out*/

    GameBoard.fiftyMove++;
    if (Captured(move) != Pieces.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    if (PiecePawn[GameBoard.pieces[from]]) {
        GameBoard.fiftyMove = 0;
        if ((move & PAWN_START_FLAG) != 0) {
            if (GameBoard.side == Colours.WHITE) {
                GameBoard.enPas = from - 10;
            } else {
                GameBoard.enPas = from + 10;
            }
            HashEnPas();
        }
    }
    GameBoard.hisPly++;
    GameBoard.ply++;

    MovePiece(from, to);
    let promoted = Promoted(move);
    if (promoted != Pieces.EMPTY) {
        ClearPiece(to);
        AddPiece(promoted, to);
    }

    GameBoard.side ^= 1;
    HashSide();

    if (SqAttacked(GameBoard.pList[PieceIndex(Kings[side], 0)], GameBoard.side)) {
        UndoMove();
        return false;
    }
    return true;
}

export function UndoMove() {
    GameBoard.hisPly--;
    GameBoard.ply--;

    let move = GameBoard.history[GameBoard.hisPly].move;
    let from = FromSq(move);
    let to = ToSq(move);

    if (GameBoard.enPas != Squares.NO_SQ) HashEnPas();
    HashCastle();

    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;

    if (GameBoard.enPas != Squares.NO_SQ) HashEnPas();
    HashCastle();

    GameBoard.side ^= 1;
    HashSide();

    if ((move & EN_PAS_FLAG) != 0) {
        if (GameBoard.side == Colours.WHITE) {
            AddPiece(Pieces.B_PAWN, to + 10);
        } else {
            AddPiece(Pieces.W_PAWN, to - 10);
        }
    } else if ((move & CASTLE_FLAG) != 0) {
        switch (to) {
            case Squares.C1:
                MovePiece(Squares.D1, Squares.A1);
                break;
            case Squares.G1:
                MovePiece(Squares.F1, Squares.H1);
                break;
            case Squares.C8:
                MovePiece(Squares.D8, Squares.A8);
                break;
            case Squares.G8:
                MovePiece(Squares.F8, Squares.H8);
                break;
            default:
                console.log("Error: could not undo castle");
                break;
        }
    }

    MovePiece(to, from);

    let captured = Captured(move);
    if (captured != Pieces.EMPTY) {
        AddPiece(captured, to);
    }
    if (Promoted(move) != Pieces.EMPTY) {
        ClearPiece(from);
        AddPiece((GameBoard.side == Colours.WHITE ? Pieces.W_PAWN : Pieces.B_PAWN), from);
    }
}