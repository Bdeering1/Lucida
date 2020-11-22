function PIECEINDEX(piece, pieceNum) {
    return (piece * 10 + pieceNUm);
}

var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM); /* gives the piece id for each 120 squares on the board (0 if empty)*/
GameBoard.side = new Array(COLOUR.WHITE);
GameBoard.fifityMove = 0;
GameBoard.plyNum = 0; /*actual ply*/
GameBoard.ply = 0; /*ply for engine cslculation*/
GameBoard.enPas = 0; /* stores one square where en passent can happen (only one total is possible at a time)*/
GameBoard.castlePerm = 0; /* one of 16 numbers representing the different castle permissions for each side*/
GameBoard.material = new Array(2); /*white, black material total*/
GameBoard.numPieces = new Array(13); /*indexed by PIECES, previously pieceNum*/
GameBoard.pList = new Array(14 * 10); /*list of number of each type of pieces for each side*/
GameBoard.posKey = 0; /*unique key for each board position, used for repetition detection*/

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