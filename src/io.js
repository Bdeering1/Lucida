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

function PrintBoard() { /*Gameboard: pieces, side, enPas, castlePerm, posKey*/
    var sq, file, rank, piece;

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
    console.log("Key: " + GameBoard.posKey.toString(16) + "\n\n");
}

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
    
    console.log("Squares attacked by black: \n");
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

function PrintPieceLists() {
    var piece, pieceNum;
    
    console.log("PIECES: ");
    for (piece = PIECES.wP; piece <= PIECES.bK; piece++) {
        for (numPieces = 0; numPieces < GameBoard.numPieces[piece]; numPieces++) {
            console.log(PieceChar[piece] + " on " + PrSq(GameBoard.pList[PIECEINDEX(piece, numPieces)]));
        }
    }
}

function PrintMoveList() {
    var moveCnt = 0;
    for (i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply+1]; i++) {
        console.log(PrMove(GameBoard.moveList[i]));
        moveCnt++;
    }
    
    console.log("\n" + moveCnt + " total moves.");
}

/*Adding padEnd() to js if not found*/
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
}