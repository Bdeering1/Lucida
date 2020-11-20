function PIECEINDEX(piece, pieceNum) {
    return (piece * 10 + pieceNUm);
}

var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM);
GameBoard.side = new Array(COLOUR.WHITE);
GameBoard.fifityMove = 0;
GameBoard.plyNum = 0;
GameBoard.ply = 0;
GameBoard.enPas = 0;
GameBoard.castlePerm = 0;
GameBoard.material = new Array(2); /*white, black material total*/
GameBoard.numPieces = new Array(13); /*indexed by PIECES*/
GameBoard.pList = new Array(14 * 10); /*list of number of each type of pieces for each side*/
GameBoard.posKey = 0; /*unique key for each board position*/