function PIECEINDEX(piece, pieceNum) {
    return (piece * 10 + pieceNUm);
}

var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM); /* gives the piece id for each 120 squares on the board (0 if empty)*/
GameBoard.side = new Array(COLOUR.WHITE);
GameBoard.fiftyMove = 0;
GameBoard.plyNum = 0; /*actual ply*/
GameBoard.ply = 0; /*ply for engine cslculation*/
GameBoard.enPas = 0; /* stores one square where en passent can happen (only one total is possible at a time)*/
GameBoard.castlePerm = 0; /* one of 16 numbers representing the different castle permissions for each side*/
GameBoard.material = new Array(2); /*white, black material total*/
GameBoard.numPieces = new Array(13); /*number of each type of piece for each side, indexed by PIECES, previously pieceNum*/
GameBoard.pList = new Array(14 * 120); /*return for a certain piece index the square that piece is on*/
GameBoard.posKey = 0; /*unique key for each board position, used for repetition detection*/

GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

function PrintBoard() {
    var sq, file, rank, piece;

    console.log("\nGameBoard:\n");
    for (rank = RANKS.RANK_8; ranks >= RANKS.RANK_1; rank--) {
        var line = (RankChar[rank] + " ");
        for (file = FILE.FILE_A; file <= FILE.FILE_H; file++) {
            sq = FR2SQ(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PieceChar[piece] + " ");
        }
        console.log(line);
    }
    console.log("");
    var line = "   ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += (" " + FileChar(file) + " ");
    }
    console.log(line);
    
    console.log("Side: " + SideChar[GambeBoard.side]);
    console.log("En Pas: " + GameBoard.enPas);
    
    line = "";
    if (GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K'; /*AND mask to retrieve each bit in castlePerm*/
    if (GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q'; 
    if (GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k'; 
    if (GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
    console.log("Castle: " + line);
    console.log("Key: " + GameBoard.posKey + " or " + GameBoard.posKey.toString(16));
}

function GeneratePosKey() {
    var sq = 0;
    var finalKey = 0;
    var piece = PIECES.EMPTY;
    
    for (sq = 0; sq < 120; sq++) {
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
    
    finalKey ^= CastleKeys[gameBoard.castlePerm];
    
    return finalKey;
}

function ResetBoard() {
    for (i = 0; i < BRD_SQ_NUM; i++) {
        GameBoard.pieces[i] = SQUARES.OFFBOARD;
    }
    
    for (i = 0; i < 64; i++) {
        GameBoard.pieces[SQ120(i)] = PIECES.EMPTY;
    }
    
    for (i = 0; i < 14 * 120; i++) {
        GameBoard.pList[i] = PIECES.EMPTY;
    }
    
    for (i = 0; i < 2; i++) {
        GameBoard.material[i] = 0;
    }
    
    for (i = 0; i < 13; i++) {
        GameBoard.numPieces[i] = 0;
    }
    
    GameBoard.side = COLOURS.BOTH;
    GameBoard.enPas = SQUARS.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.plyNum = 0;
    GameBoard.ply = 0;
    GameBoard.castlePerm = 0;
    GambeBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

function ParseFen(fen) {
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
                piece = PIECES.empty;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt(); /*converting the char to an int*/
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                break;
            
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
    
    GameBoard.side = (fen[fenCnt] == 'w') ? COULOURS.WHITE : COLOURS.BLACK; /*if a 1 is found, set side to white, else set to black*/
    fenCnt += 2;
    
    while (fen[fenCnt] != ' ')  { /*changed from orignial code, ensure this works****/
        switch (fen[fenCnt]) { /*assumes the FEN string is correct*/
            case 'K': GameBoard.castPerm |= CASTLEBIT.WKCA; break; /*setting each castling permission using bitwise or '|='*/
            case 'Q': GameBoard.castPerm |= CASTLEBIT.WQCA; break;
            case 'k': GameBoard.castPerm |= CASTLEBIT.BKCA; break;
            case 'q': GameBoard.castPerm |= CASTLEBIT.BQCA; break;
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
    
    
}

















