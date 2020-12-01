function PIECEINDEX(piece, pieceNum) {
    return (piece * 10 + pieceNum);
}

var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM); /* gives the piece id for each 120 squares on the board (0 if empty)*/
GameBoard.side = COLOURS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.plyNum = 0; /*actual ply*/
GameBoard.ply = 0; /*ply for engine calculation*/
GameBoard.enPas = 0; /* stores one square where en passant can happen (only one total is possible at a time)*/
GameBoard.castlePerm = 0; /* one of 16 numbers representing the different castle permissions for each side*/
GameBoard.material = new Array(2); /*white, black material total*/
GameBoard.numPieces = new Array(13); /*number of each type of piece for each side, indexed by PIECES, previously pieceNum*/
GameBoard.pList = new Array(14 * 10); /*list of pieces (10 max of each piece type), stores the square each piece is on, indexed by PIECEINDEX*/
GameBoard.posKey = 0; /*unique key for each board position, used for repetition detection*/

GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

/*Called from main*/
function PrintBoard() { /*Gameboard: pieces, side, enPas, castlePerm, posKey*/
    var sq, file, rank, piece;

    console.log("\nGameBoard:\n");
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        var line = (RankChar[rank] + " ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PieceChar[piece] + " ");
        }
        console.log(line);
    }
    var line = "  ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += (" " + FileChar[file] + " ");
    }
    console.log(line);
    
    console.log("Side: " + SideChar[GameBoard.side]);
    console.log("En Pas: " + GameBoard.enPas);
    
    line = "";
    if (GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K'; /*AND mask to retrieve each bit in castlePerm*/
    if (GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q'; 
    if (GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k'; 
    if (GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
    console.log("Castle: " + line);
    console.log("Key: " + GameBoard.posKey.toString(16));
}

function GeneratePosKey() {
    var sq = 0;
    var finalKey = 0;
    var piece = PIECES.EMPTY;
    
    for (sq = 0; sq < BRD_SQ_NUM; sq++) {
        piece = GameBoard.pieces[sq];
        if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
            finalKey ^= PieceKeys[(piece * 120) + sq]; /* XORing one of the 14 * 120 random generated hashes into the final key */
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

function PrintPieceLists() {
    
    var piece, pieceNum;
    
    for (piece = PIECES.wP; piece <= PIECES.bK; piece++) {
        for (numPieces = 0; numPieces < GameBoard.numPieces[piece]; numPieces++) {
            console.log(PieceChar[piece] + " on " + PrSq(GameBoard.pList[PIECEINDEX(piece, numPieces)]));
        }
    }
    
}

/*Calls PrintPieceLists*/
function UpdateListsMaterial() {
    var piece, sq, colour;
    
    for (i = 0; i < 14 * 10; i++) { /*120?? 10?? just changed this value*/
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
    
    /*PrintPieceLists();*/
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
    GameBoard.plyNum = 0;
    GameBoard.ply = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

/*Calls ResetBoard, UpdateListsMaterial, and GeneratePosKey*/
function ParseFen(fen) {
    console.log("ParseFen() called");
    ResetBoard();
    
    var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0; /*dictates how many times the loop is run through for empty squares in fen string (number values)*/
    var i = 0;
    var sq120 = 0;
    var fenCnt = 0; /*index for fen*/
    
    while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
        count = 1;
        
        switch (fen[fenCnt]) {
            case 'p': piece = PIECES.bP; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'r': piece = PIECES.bR; break;
            case 'q': piece = PIECES.bQ; break;
            case 'k': piece = PIECES.bK; break;
            case 'P': piece = PIECES.wP; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'R': piece = PIECES.wR; break;
            case 'Q': piece = PIECES.wQ; break;
            case 'K': piece = PIECES.wK; break;
            
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt(); /*converting the char to an int*/
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;
            
            default:
                console.log("FEN error");
                return;
        }
        
        for (i = 0; i < count; i++) {
            sq120 = FR2SQ(file,rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }
        fenCnt++;
    } /*while loop end*/
    
    GameBoard.side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK; /*if a 1 is found, set side to white, else set to black*/
    fenCnt += 2;
    
    while (fen[fenCnt] != ' ')  { /*changed from orignial code, ensure this works****/
        switch (fen[fenCnt]) { /*assumes the FEN string is correct*/
            case 'K': GameBoard.castlePerm |= CASTLEBIT.WKCA; break; /*setting each castling permission using bitwise or '|='*/
            case 'Q': GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
            case 'k': GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
            case 'q': GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
            default: break;
        }
        fenCnt++;
    }
    fenCnt++;
    
    if (fen[fenCnt] != '-') { /*assuming FEN is correct (if there is no dash the en pas square is valid)*/
        file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt(); /*make into a function?*/
        rank = fen[fenCnt+1].charCodeAt() - '1'.charCodeAt();
        console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
        GameBoard.enPas = FR2SQ(file,rank);
    }
    
    GameBoard.posKey = GeneratePosKey();
    
    UpdateListsMaterial();
    PrintSqAttacked();
}

/*For debugging SqAttacked, called by ParseFen()*/
function PrintSqAttacked() {
    var sq, file, rank, piece;
    
    console.log("\nSquares attacked by white: \n");
    
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) { /*going from the backrank so that it prints nicely*/
        var line = (RankChar[rank] + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttacked(sq, COLOURS.WHITE) == true) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
    
    console.log("\nSquares attacked by black: \n");
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) { /*going from the backrank so that it prints nicely*/
        var line = (RankChar[rank] + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttacked(sq, COLOURS.BLACK) == true) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
}

/*Looking for threats on the board*/
function SqAttacked(sq, side) { /*(is this square attacked by this side?)*/
    var pce, t_sq, dir;
    
/*Non sliding attacks (pawn, knight, and king)*/
    if (side == COLOURS.WHITE) {
        if (GameBoard.pieces[sq - 11] == PIECES.wP || GameBoard.pieces[sq - 9] == PIECES.wP) {
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
        if (GameBoard.pieces[sq + 11] == PIECES.bP || GameBoard.pieces[sq + 9] == PIECES.bP) {
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














