import { BRD_SQ_NUM, CastleBit, Colours, Files, MAX_DEPTH, MAX_POSITION_MOVES, Pieces, Ranks, Squares } from "../shared/constants";
import { PieceKeys, SideKey, CastleKeys, Sq120, PieceCol, PieceVal, PieceIndex, GetSquare, NDir, KDir, BDir, PieceBishopQueen, RDir, PieceRookQueen } from "../shared/utils";


export var GameBoard = {
    pieces: new Array(BRD_SQ_NUM), /*gives the piece id for each 120 squares on the board (0 if empty)*/
    side: Colours.WHITE,
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
}

export function GeneratePosKey() {
    var finalKey = 0;
    var piece = Pieces.EMPTY;

    for (let sq = 0; sq < BRD_SQ_NUM; sq++) { // should this be looping through 120 squares or only 64??
        piece = GameBoard.pieces[sq];
        if (piece != Pieces.EMPTY && sq != Squares.OFF_BOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq]; /* XORing one of the 13 * 120 hashes into the final key */
        }
    }

    if (GameBoard.side == Colours.WHITE) {
        finalKey ^= SideKey;
    }

    if (GameBoard.enPas != Squares.NO_SQ) {
        finalKey ^= PieceKeys[GameBoard.enPas];
    }

    finalKey ^= CastleKeys[GameBoard.castlePerm];

    return finalKey;
}

export function UpdateListsMaterial() {
    var piece, sq, colour;

    for (let i = 0; i < 13 * 10; i++) {
        GameBoard.pList[i] = Pieces.EMPTY;
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
        if (piece != Pieces.EMPTY) {
            colour = PieceCol[piece];

            GameBoard.material[colour] += PieceVal[piece];

            GameBoard.pList[PieceIndex(piece, GameBoard.numPieces[piece])] = sq;
            GameBoard.numPieces[piece]++;
        }
    }
}

export function ResetBoard() { /* doesn't reset history (should it?)*/
    for (let i = 0; i < BRD_SQ_NUM; i++) {
        GameBoard.pieces[i] = Squares.OFF_BOARD;
    }

    for (let i = 0; i < 64; i++) {
        GameBoard.pieces[Sq120(i)] = Pieces.EMPTY;
    }

    GameBoard.side = Colours.BOTH;
    GameBoard.enPas = Squares.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.hisPly = 0;
    GameBoard.ply = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

export function ParseFen(fen) { /*Calls ResetBoard, UpdateListsMaterial, and GeneratePosKey*/
    ResetBoard();

    var rank = Ranks.RANK_8;
    var file = Files.FILE_A;
    var piece = 0;
    var count = 0; /*dictates how many times the loop is run through for empty squares in fen string (number values)*/
    var sq120 = 0;
    var fenIndex = 0;

    while ((rank >= Ranks.RANK_1) && fenIndex < fen.length) {
        count = 1;

        switch (fen[fenIndex]) {
            case 'p':
                piece = Pieces.B_PAWN;
                break;
            case 'n':
                piece = Pieces.B_KNIGHT;
                break;
            case 'b':
                piece = Pieces.B_BISHOP;
                break;
            case 'r':
                piece = Pieces.B_ROOK;
                break;
            case 'q':
                piece = Pieces.B_QUEEN;
                break;
            case 'k':
                piece = Pieces.B_KNIGHT;
                break;
            case 'P':
                piece = Pieces.W_PAWN;
                break;
            case 'N':
                piece = Pieces.W_KNIGHT;
                break;
            case 'B':
                piece = Pieces.W_BISHOP;
                break;
            case 'R':
                piece = Pieces.W_ROOK;
                break;
            case 'Q':
                piece = Pieces.W_QUEEN;
                break;
            case 'K':
                piece = Pieces.W_KING;
                break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = Pieces.EMPTY;
                count = fen[fenIndex].charCodeAt(0) - '0'.charCodeAt(0); /*converting the char to an int*/
                break;

            case '/':
            case ' ':
                rank--;
                file = Files.FILE_A;
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

    GameBoard.side = (fen[fenIndex] == 'w') ? Colours.WHITE : Colours.BLACK; /*if a 1 is found, set side to white, else set to black*/
    fenIndex += 2;

    while (fen[fenIndex] != ' ') {
        switch (fen[fenIndex]) { /*assumes the FEN string is correct*/
            case 'K':
                GameBoard.castlePerm |= CastleBit.W_KING;
                break; /*setting each castling permission using bitwise or '|='*/
            case 'Q':
                GameBoard.castlePerm |= CastleBit.W_QUEEN;
                break;
            case 'k':
                GameBoard.castlePerm |= CastleBit.B_KING;
                break;
            case 'q':
                GameBoard.castlePerm |= CastleBit.B_QUEEN;
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
    var pce, t_sq, dir;

    /*Non sliding attacks (pawn, knight, and king)*/
    if (side == Colours.WHITE) {
        if (GameBoard.pieces[sq + 11] == Pieces.W_PAWN || GameBoard.pieces[sq + 9] == Pieces.W_PAWN) {
            return true;
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + NDir[i]] == Pieces.W_KNIGHT) {
                return true;
            }
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + KDir[i]] == Pieces.W_KING) {
                return true;
            }
        }

    } else {
        if (GameBoard.pieces[sq - 11] == Pieces.B_PAWN || GameBoard.pieces[sq - 9] == Pieces.B_PAWN) {
            return true;
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + NDir[i]] == Pieces.B_KNIGHT) {
                return true;
            }
        }
        for (let i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + KDir[i]] == Pieces.B_KNIGHT) {
                return true;
            }
        }
    }

    /*Bishop + Queen attacks*/
    for (let i = 0; i < 4; i++) {
        dir = BDir[i];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while (pce != Squares.OFF_BOARD) {
            if (pce != Pieces.EMPTY) {
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
        while (pce != Squares.OFF_BOARD) {
            if (pce != Pieces.EMPTY) {
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

export function HashPiece(pceType, sq) { GameBoard.posKey ^= PieceKeys[(pceType * 120) + sq]; }
export function HashCastle() { GameBoard.posKey ^= CastleKeys[GameBoard.castlePerm]; } /*we should either hash out the existing key first or just get the CASTLEBIT*/
export function HashSide() { GameBoard.posKey ^= SideKey; }
export function HashEnPas() { GameBoard.posKey ^= PieceKeys[GameBoard.enPas]; }