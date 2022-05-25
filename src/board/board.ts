import { BRD_SQ_NUM, CastleBit, Colour, File, MAX_DEPTH, MAX_POSITION_MOVES, Piece, Rank, Square } from "../shared/constants";
import { Sq120, PieceCol, PieceVal, PieceIndex, GetSquare, NDir, KDir, BDir, PieceBishopQueen, RDir, PieceRookQueen, BoardUtils } from "../shared/utils";


export const GameBoard = {
    pieces: new Array(BRD_SQ_NUM), /*gives the piece id for each 120 squares on the board (0 if empty)*/
    side: Colour.white,
    fiftyMove: 0,
    hisPly: 0, /*actual ply*/
    history: [],
    ply: 0, /*ply for engine calculation*/
    enPas: 0, /* stores one square where en passant can happen (only one total is possible at a time)*/
    castlePerm: 0, /* one of 16 numbers representing the different castle permissions for each side*/
    material: new Array(2), /*material total for both sides*/
    numPieces: new Array(13), /*number of each type of piece for each side, indexed by PIECES, previously pceNum*/
    pList: new Array(13 * 10), /*list of pieces (10 max of each piece type), stores the square each piece is on, indexed by PIECEINDEX*/
    posKey: 0, /*unique key for each board position, used for repetition detection*/
    moveList: new Array(MAX_DEPTH * MAX_POSITION_MOVES),
    moveScores: new Array(MAX_DEPTH * MAX_POSITION_MOVES),
    moveListStart: new Array(MAX_DEPTH),
};

export function GeneratePosKey() {
    let finalKey = 0;
    let piece = Piece.empty;

    for (let sq = 0; sq < BRD_SQ_NUM; sq++) { // should this be looping through 120 squares or only 64??
        piece = GameBoard.pieces[sq];
        if (piece != Piece.empty && sq != Square.offBoard) {
            finalKey ^= BoardUtils.PieceKeys[(piece * 120) + sq]; /* XORing one of the 13 * 120 hashes into the final key */
        }
    }

    if (GameBoard.side == Colour.white) {
        finalKey ^= BoardUtils.SideKey;
    }

    if (GameBoard.enPas != Square.noSquare) {
        finalKey ^= BoardUtils.PieceKeys[GameBoard.enPas];
    }

    finalKey ^= BoardUtils.CastleKeys[GameBoard.castlePerm];

    return finalKey;
}

export function UpdateListsMaterial() {
    let piece, sq, colour;

    for (let i = 0; i < 13 * 10; i++) {
        GameBoard.pList[i] = Piece.empty;
    }

    for (let i = 0; i < 2; i++) {
        GameBoard.material[i] = 0;
    }

    for (let i = 0; i < 13; i++) {
        GameBoard.numPieces[i] = 0;
    }

    for (let i = 0; i < 64; i++) {
        sq = Sq120(i);
        piece = GameBoard.pieces[sq];
        if (piece != Piece.empty) {
            colour = PieceCol[piece];

            GameBoard.material[colour] += PieceVal[piece];

            GameBoard.pList[PieceIndex(piece, GameBoard.numPieces[piece])] = sq;
            GameBoard.numPieces[piece]++;
        }
    }
}

export function ResetBoard() { /* doesn't reset history (should it?)*/
    for (let i = 0; i < BRD_SQ_NUM; i++) {
        GameBoard.pieces[i] = Square.offBoard;
    }

    for (let i = 0; i < 64; i++) {
        GameBoard.pieces[Sq120(i)] = Piece.empty;
    }

    GameBoard.side = Colour.both;
    GameBoard.enPas = Square.noSquare;
    GameBoard.fiftyMove = 0;
    GameBoard.hisPly = 0;
    GameBoard.ply = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

export function ParseFen(fen) { /*Calls ResetBoard, UpdateListsMaterial, and GeneratePosKey*/
    ResetBoard();

    let rank = Rank.eight;
    let file = File.a;
    let piece = 0;
    let count = 0; /*dictates how many times the loop is run through for empty squares in fen string (number values)*/
    let sq120 = 0;
    let fenIndex = 0;

    while ((rank >= Rank.one) && fenIndex < fen.length) {
        count = 1;

        switch (fen[fenIndex]) {
            case 'p':
                piece = Piece.blackPawn;
                break;
            case 'n':
                piece = Piece.blackKnight;
                break;
            case 'b':
                piece = Piece.blackBishop;
                break;
            case 'r':
                piece = Piece.blackRook;
                break;
            case 'q':
                piece = Piece.blackQueen;
                break;
            case 'k':
                piece = Piece.blackKnight;
                break;
            case 'P':
                piece = Piece.whitePawn;
                break;
            case 'N':
                piece = Piece.whiteKnight;
                break;
            case 'B':
                piece = Piece.whiteBishop;
                break;
            case 'R':
                piece = Piece.whiteRook;
                break;
            case 'Q':
                piece = Piece.whiteQueen;
                break;
            case 'K':
                piece = Piece.whiteKing;
                break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = Piece.empty;
                count = fen[fenIndex].charCodeAt(0) - '0'.charCodeAt(0); /*converting the char to an int*/
                break;

            case '/':
            case ' ':
                rank--;
                file = File.a;
                fenIndex++;
                continue;

            default:
                console.log("FEN error");
                return;
        }

        for (let i = 0; i < count; i++) {
            sq120 = GetSquare(file, rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }
        fenIndex++;
    }

    GameBoard.side = (fen[fenIndex] == 'w') ? Colour.white : Colour.black; /*if a 1 is found, set side to white, else set to black*/
    fenIndex += 2;

    while (fen[fenIndex] != ' ') {
        switch (fen[fenIndex]) { /*assumes the FEN string is correct*/
            case 'K':
                GameBoard.castlePerm |= CastleBit.whiteKing;
                break; /*setting each castling permission using bitwise or '|='*/
            case 'Q':
                GameBoard.castlePerm |= CastleBit.whiteQueen;
                break;
            case 'k':
                GameBoard.castlePerm |= CastleBit.blackKing;
                break;
            case 'q':
                GameBoard.castlePerm |= CastleBit.blackQueen;
                break;
            default:
                break;
        }
        fenIndex++;
    }
    fenIndex++;

    if (fen[fenIndex] != '-') { /*assuming FEN is correct (if there is no dash the en pas square is valid)*/
        file = fen[fenIndex].charCodeAt() - 'a'.charCodeAt(0); /*make into a function?*/
        rank = fen[fenIndex + 1].charCodeAt() - '1'.charCodeAt(0);
        GameBoard.enPas = GetSquare(file, rank);
    }

    GameBoard.posKey = GeneratePosKey();

    UpdateListsMaterial();
}

export function SqAttacked(sq, side) { /*(is this square attacked by this side?)*/
    let pce, t_sq, dir;

    /*Non sliding attacks (pawn, knight, and king)*/
    if (side == Colour.white) {
        if (GameBoard.pieces[sq + 11] == Piece.whitePawn || GameBoard.pieces[sq + 9] == Piece.whitePawn) {
            return true;
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + NDir[i]] == Piece.whiteKnight) {
                return true;
            }
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + KDir[i]] == Piece.whiteKing) {
                return true;
            }
        }

    } else {
        if (GameBoard.pieces[sq - 11] == Piece.blackPawn || GameBoard.pieces[sq - 9] == Piece.blackPawn) {
            return true;
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + NDir[i]] == Piece.blackKnight) {
                return true;
            }
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + KDir[i]] == Piece.blackKnight) {
                return true;
            }
        }
    }

    /*Bishop + Queen attacks*/
    for (let i = 0; i < 4; i++) {
        dir = BDir[i];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while (pce != Square.offBoard) {
            if (pce != Piece.empty) {
                if (PieceBishopQueen[pce] && PieceCol[pce] == side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoard.pieces[t_sq];
        }
    }
    /*Rook + Queen attacks*/
    for (let i = 0; i < 4; i++) {
        dir = RDir[i];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while (pce != Square.offBoard) {
            if (pce != Piece.empty) {
                if (PieceRookQueen[pce] && PieceCol[pce] == side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoard.pieces[t_sq];
        }
    }

    return false;
}

export function HashPiece(pceType, sq) { GameBoard.posKey ^= BoardUtils.PieceKeys[(pceType * 120) + sq]; }
export function HashCastle() { GameBoard.posKey ^= BoardUtils.CastleKeys[GameBoard.castlePerm]; } /*we should either hash out the existing key first or just get the CASTLEBIT*/
export function HashSide() { GameBoard.posKey ^= BoardUtils.SideKey; }
export function HashEnPas() { GameBoard.posKey ^= BoardUtils.PieceKeys[GameBoard.enPas]; }