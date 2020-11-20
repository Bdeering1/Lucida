var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM);
GameBoard.side = new Array(COLOUR.WHITE);
GameBoard.fifityMove = 0;
GameBoard.plyNum = 0;
GameBoard.ply = 0;
GameBoard.castlePerm = 0;