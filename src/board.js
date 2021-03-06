var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM); /*gives the piece id for each 120 squares on the board (0 if empty)*/
GameBoard.side = COLOURS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.hisPly = 0; /*actual ply*/
GameBoard.history = [];
GameBoard.ply = 0; /*ply for engine calculation*/
GameBoard.enPas = 0; /* stores one square where en passant can happen (only one total is possible at a time)*/
GameBoard.castlePerm = 0; /* one of 16 numbers representing the different castle permissions for each side*/
GameBoard.material = new Array(2); /*material total for both sides*/
GameBoard.numPieces = new Array(13); /*number of each type of piece for each side, indexed by PIECES, previously pceNum*/
GameBoard.pList = new Array(13 * 10); /*list of pieces (10 max of each piece type), stores the square each piece is on, indexed by PIECEINDEX*/
GameBoard.posKey = 0; /*unique key for each board position, used for repetition detection*/

GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

function GeneratePosKey() {
    var sq = 0;
    var finalKey = 0;
    var piece = PIECES.EMPTY;

    for (sq = 0; sq < BRD_SQ_NUM; sq++) {
        piece = GameBoard.pieces[sq];
        if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq]; /* XORing one of the 13 * 120 random generated hashes into the final key */
        }
    }

    if (GameBoard.side == COLOURS.WHITE) {
        finalKey ^= SideKey;
    }

    if (GameBoard.enPas != SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[GameBoard.enPas];
    }

    finalKey ^= CastleKeys[GameBoard.castlePerm];

    return finalKey;
}

function UpdateListsMaterial() {
    var piece, sq, colour;

    for (i = 0; i < 13 * 10; i++) {
        GameBoard.pList[i] = PIECES.EMPTY;
    }

    for (i = 0; i < 2; i++) {
        GameBoard.material[i] = 0;
    }

    for (i = 0; i < 13; i++) {
        GameBoard.numPieces[i] = 0;
    }

    for (i = 0; i < 64; i++) {
        sq = SQ120(i);
        piece = GameBoard.pieces[sq];
        if (piece != PIECES.EMPTY) {
            colour = PieceCol[piece];

            GameBoard.material[colour] += PieceVal[piece];

            GameBoard.pList[PIECEINDEX(piece, GameBoard.numPieces[piece])] = sq;
            GameBoard.numPieces[piece]++;
        }
    }
}

function ResetBoard() {
    for (i = 0; i < BRD_SQ_NUM; i++) {
        GameBoard.pieces[i] = SQUARES.OFFBOARD;
    }

    for (i = 0; i < 64; i++) {
        GameBoard.pieces[SQ120(i)] = PIECES.EMPTY;
    }

    GameBoard.side = COLOURS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.hisPly = 0;
    GameBoard.ply = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

function ParseFen(fen) { /*Calls ResetBoard, UpdateListsMaterial, and GeneratePosKey*/
    ResetBoard();

    var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0; /*dictates how many times the loop is run through for empty squares in fen string (number values)*/
    var sq120 = 0;
    var fenIndex = 0;

    while ((rank >= RANKS.RANK_1) && fenIndex < fen.length) {
        count = 1;

        switch (fen[fenIndex]) {
            case 'p':
                piece = PIECES.bP;
                break;
            case 'n':
                piece = PIECES.bN;
                break;
            case 'b':
                piece = PIECES.bB;
                break;
            case 'r':
                piece = PIECES.bR;
                break;
            case 'q':
                piece = PIECES.bQ;
                break;
            case 'k':
                piece = PIECES.bK;
                break;
            case 'P':
                piece = PIECES.wP;
                break;
            case 'N':
                piece = PIECES.wN;
                break;
            case 'B':
                piece = PIECES.wB;
                break;
            case 'R':
                piece = PIECES.wR;
                break;
            case 'Q':
                piece = PIECES.wQ;
                break;
            case 'K':
                piece = PIECES.wK;
                break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenIndex].charCodeAt() - '0'.charCodeAt(); /*converting the char to an int*/
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenIndex++;
                continue;

            default:
                console.log("FEN error");
                return;
        }

        for (i = 0; i < count; i++) {
            sq120 = FR2SQ(file, rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }
        fenIndex++;
    }

    GameBoard.side = (fen[fenIndex] == 'w') ? COLOURS.WHITE : COLOURS.BLACK; /*if a 1 is found, set side to white, else set to black*/
    fenIndex += 2;

    while (fen[fenIndex] != ' ') {
        switch (fen[fenIndex]) { /*assumes the FEN string is correct*/
            case 'K':
                GameBoard.castlePerm |= CASTLEBIT.WKCA;
                break; /*setting each castling permission using bitwise or '|='*/
            case 'Q':
                GameBoard.castlePerm |= CASTLEBIT.WQCA;
                break;
            case 'k':
                GameBoard.castlePerm |= CASTLEBIT.BKCA;
                break;
            case 'q':
                GameBoard.castlePerm |= CASTLEBIT.BQCA;
                break;
            default:
                break;
        }
        fenIndex++;
    }
    fenIndex++;

    if (fen[fenIndex] != '-') { /*assuming FEN is correct (if there is no dash the en pas square is valid)*/
        file = fen[fenIndex].charCodeAt() - 'a'.charCodeAt(); /*make into a function?*/
        rank = fen[fenIndex + 1].charCodeAt() - '1'.charCodeAt();
        GameBoard.enPas = FR2SQ(file, rank);
    }

    GameBoard.posKey = GeneratePosKey();

    UpdateListsMaterial();
}

function SqAttacked(sq, side) { /*(is this square attacked by this side?)*/
    var pce, t_sq, dir;

    /*Non sliding attacks (pawn, knight, and king)*/
    if (side == COLOURS.WHITE) {
        if (GameBoard.pieces[sq + 11] == PIECES.wP || GameBoard.pieces[sq + 9] == PIECES.wP) {
            return true;
        }
        for (i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + NDir[i]] == PIECES.wN) {
                return true;
            }
        }
        for (i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + KDir[i]] == PIECES.wK) {
                return true;
            }
        }

    } else {
        if (GameBoard.pieces[sq - 11] == PIECES.bP || GameBoard.pieces[sq - 9] == PIECES.bP) {
            return true;
        }
        for (i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + NDir[i]] == PIECES.bN) {
                return true;
            }
        }
        for (i = 0; i < 8; i++) {
            if (GameBoard.pieces[sq + KDir[i]] == PIECES.bK) {
                return true;
            }
        }
    }

    /*Bishop + Queen attacks*/
    for (i = 0; i < 4; i++) {
        dir = BDir[i];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while (pce != SQUARES.OFFBOARD) {
            if (pce != PIECES.EMPTY) {
                if (PieceBishopQueen[pce] == true && PieceCol[pce] == side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoard.pieces[t_sq];
        }
    }
    /*Rook + Queen attacks*/
    for (i = 0; i < 4; i++) {
        dir = RDir[i];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while (pce != SQUARES.OFFBOARD) {
            if (pce != PIECES.EMPTY) {
                if (PieceRookQueen[pce] == true && PieceCol[pce] == side) {
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