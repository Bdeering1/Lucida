function PrSq(sq) {
    
    return (FileChar[FilesBoard[sq]] + RankChar[RanksBoard[sq]]);

}

function PrMove(move) {
    var MoveStr;
    
    ff = FilesBoard[FROMSQ(move)]; /*file from, rank from, etc*/
    rf = RanksBoard[FROMSQ(move)];
    ft = FilesBoard[TOSQ(move)];
    rt = RanksBoard[TOSQ(move)];
   
    MoveStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];
    
    var promoted = PROMOTED(move);
    if (promoted != PIECES.EMPTY) {
        MoveStr += PieceChar[promoted].toLowerCase();
    }
    
    return MoveStr;
}

function PrintMoveList() {    
    for (i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply+1]; i++) {
        console.log(PrMove(GameBoard.moveList[i]));
    }
    
    console.log("\n" + i + " total moves.");
}