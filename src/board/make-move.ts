import { CASTLE_FLAG, EN_PAS_FLAG, NUM_PIECE_TYPES, PAWN_START_FLAG } from "../shared/constants";
import { Captured, CastlePerm, FromSq, Kings, PieceCol, PieceIndex, PiecePawn, PieceVal, Promoted, ToSq } from "../shared/utils";
import { Colour, Piece, Square } from "../shared/enums";
import { GameBoard, HashCastle, HashEnPas, HashPiece, HashSide, SqAttacked } from "./board";


export function ClearPiece(sq) {
    const pceType = GameBoard.pieces[sq];
    if (pceType === Piece.empty) {
        console.log("Error: trying to clear empty piece");
        return;
    }

    const col = PieceCol[pceType];
    let pceNum = -1;

    HashPiece(pceType, sq);

    GameBoard.pieces[sq] = Piece.empty;
    GameBoard.material[col] -= PieceVal[pceType];

    for (let i = 0; i < GameBoard.numPieces[pceType]; i++) { /*maybe if each piece had a unique ID or something this wouldn't be necessary*/
        if (GameBoard.pList[PieceIndex(pceType, i)] === sq) {
            pceNum = i;
            break;
        }
    }
    if (pceNum === -1) {
        console.log("Error: could not find piece to clear");
    }
    GameBoard.numPieces[pceType]--;
    GameBoard.pList[PieceIndex(pceType, pceNum)] = GameBoard.pList[PieceIndex(pceType, GameBoard.numPieces[pceType])]; /*swap with end of list (after decrementing numPieces)*/
}


export function AddPiece(pceType, sq) {
    if (pceType > NUM_PIECE_TYPES) {
        console.log(`Error: pceType = ${  pceType}`);
    }

    const col = PieceCol[pceType];

    HashPiece(pceType, sq);

    GameBoard.pieces[sq] = pceType;
    GameBoard.material[col] += PieceVal[pceType];
    GameBoard.pList[PieceIndex(pceType, GameBoard.numPieces[pceType]++)] = sq; /*add to end of list*/
}

export function MovePiece(from, to) { /*make sure this is right*/
    const pceType = GameBoard.pieces[from];
    HashPiece(pceType, from);
    HashPiece(pceType, to);

    GameBoard.pieces[from] = Piece.empty;
    GameBoard.pieces[to] = pceType;

    let i = 0;
    for (i; i < GameBoard.numPieces[pceType]; i++) {
        if (GameBoard.pList[PieceIndex(pceType, i)] === from) { /*trying to find the 'ID' of the piece*/
            GameBoard.pList[PieceIndex(pceType, i)] = to;
            break;
        }
    }
    if (i === GameBoard.numPieces[pceType]) {
        console.log("Error: could not find piece");
    }
}

export function MakeMove(move) {
    if (move === null) {
        console.log("Error: empty move");
        return false;
    }

    const from = FromSq(move);
    const to = ToSq(move);
    const side = GameBoard.side;
    if (side === Colour.both) {
        console.log("Error: FEN parsing - side: BOTH");
        return false;
    }

    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;
    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    if (GameBoard.enPas !== Square.noSquare) HashEnPas();
    GameBoard.enPas = Square.noSquare;

    if ((move & EN_PAS_FLAG) !== 0) {
        if (side === Colour.white) {
            ClearPiece(to + 10);
        } else {
            ClearPiece(to - 10);
        }
    } else if ((move & CASTLE_FLAG) !== 0) {
        switch (to) {
            case Square.c1:
                MovePiece(Square.a1, Square.d1);
                break;
            case Square.g1:
                MovePiece(Square.h1, Square.f1);
                break;
            case Square.c8:
                MovePiece(Square.a8, Square.d8);
                break;
            case Square.g8:
                MovePiece(Square.h8, Square.f8);
                break;
            default:
                console.log("Error: invalid castle move");
                break;
        }
        HashCastle();
        GameBoard.castlePerm &= CastlePerm[from];
        HashCastle();
    } else if ((GameBoard.castlePerm & 15) !== 0) { /*if there are still possible castlePerm changes*/
        HashCastle();
        GameBoard.castlePerm &= CastlePerm[from];
        GameBoard.castlePerm &= CastlePerm[to]; /*in case a rook is captured*/
        HashCastle();
    } /*if there are no possible castlePerm changes castlePerm is not touched and not hashed in or out*/

    GameBoard.fiftyMove++;
    if (Captured(move) !== Piece.empty) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }
    if (PiecePawn[GameBoard.pieces[from]]) {
        GameBoard.fiftyMove = 0;
        if ((move & PAWN_START_FLAG) !== 0) {
            if (GameBoard.side === Colour.white) {
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
    const promoted = Promoted(move);
    if (promoted !== Piece.empty) {
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

    const move = GameBoard.history[GameBoard.hisPly].move;
    const from = FromSq(move);
    const to = ToSq(move);

    if (GameBoard.enPas !== Square.noSquare) HashEnPas();
    HashCastle();

    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;

    if (GameBoard.enPas !== Square.noSquare) HashEnPas();
    HashCastle();

    GameBoard.side ^= 1;
    HashSide();

    if ((move & EN_PAS_FLAG) !== 0) {
        if (GameBoard.side === Colour.white) {
            AddPiece(Piece.blackPawn, to + 10);
        } else {
            AddPiece(Piece.whitePawn, to - 10);
        }
    } else if ((move & CASTLE_FLAG) !== 0) {
        switch (to) {
            case Square.c1:
                MovePiece(Square.d1, Square.a1);
                break;
            case Square.g1:
                MovePiece(Square.f1, Square.h1);
                break;
            case Square.c8:
                MovePiece(Square.d8, Square.a8);
                break;
            case Square.g8:
                MovePiece(Square.f8, Square.h8);
                break;
            default:
                console.log("Error: could not undo castle");
                break;
        }
    }

    MovePiece(to, from);

    const captured = Captured(move);
    if (captured !== Piece.empty) {
        AddPiece(captured, to);
    }
    if (Promoted(move) !== Piece.empty) {
        ClearPiece(from);
        AddPiece((GameBoard.side === Colour.white ? Piece.whitePawn : Piece.blackPawn), from);
    }
}