import { GameBoard, SqAttacked } from "./board";
import { FILE_CHAR, RANK_CHAR, PIECE_CHAR, SIDE_CHAR, CastleBit, Colours, Files, Pieces, Ranks } from "./shared/constants";
import { FilesBoard, RanksBoard, FromSq, ToSq, Promoted, GetSquare, PieceIndex } from "./shared/utils";


export function PrSq(sq) {
    return (FILE_CHAR[FilesBoard[sq]] + RANK_CHAR[RanksBoard[sq]]);
}

export function PrMove(move) {
    var MoveStr;
    
    let ff = FilesBoard[FromSq(move)]; /*file from, rank from, etc*/
    let rf = RanksBoard[FromSq(move)];
    let ft = FilesBoard[ToSq(move)];
    let rt = RanksBoard[ToSq(move)];
   
    MoveStr = FILE_CHAR[ff] + RANK_CHAR[rf] + FILE_CHAR[ft] + RANK_CHAR[rt];
    
    var promoted = promoted(move);
    if (promoted != Pieces.EMPTY) {
        MoveStr += PIECE_CHAR[promoted].toLowerCase();
    }
    
    return MoveStr;
}

export function PrintBoard() { /*Gameboard: pieces, side, enPas, castlePerm, posKey*/
    var sq, file, rank, piece, line;

    for (rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) {
        line = (RANK_CHAR[rank] + " ");
        for (file = Files.FILE_A; file <= Files.FILE_H; file++) {
            sq = GetSquare(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PIECE_CHAR[piece] + " ");
        }
        console.log(line);
    }
    line = "  ";
    for (file = Files.FILE_A; file <= Files.FILE_H; file++) {
        line += (" " + FILE_CHAR[file] + " ");
    }
    console.log(line);
    
    console.log("Side: " + SIDE_CHAR[GameBoard.side]);
    console.log("En Pas: " + GameBoard.enPas);
    
    line = "";
    if (GameBoard.castlePerm & CastleBit.W_KING) line += 'K'; /*AND mask to retrieve each bit in castlePerm*/
    if (GameBoard.castlePerm & CastleBit.W_QUEEN) line += 'Q'; 
    if (GameBoard.castlePerm & CastleBit.B_KING) line += 'k'; 
    if (GameBoard.castlePerm & CastleBit.B_QUEEN) line += 'q';
    console.log("Castle: " + line);
    console.log("Key: " + GameBoard.posKey.toString(16) + "\n\n");
}

export function PrintSqAttacked() {
    var sq, file, rank, piece;
    
    console.log("\nSquares attacked by white: \n");
    for (rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) { /*going from the backrank so that it pxrints nicely*/
        let line = (RANK_CHAR[rank] + "  ");
        for (file = Files.FILE_A; file <= Files.FILE_H; file++) {
            sq = GetSquare(file, rank);
            if (SqAttacked(sq, Colours.WHITE)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
    
    console.log("Squares attacked by black: \n");
    for (rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) { /*going from the backrank so that it prints nicely*/
        let line = (RANK_CHAR[rank] + "  ");
        for (file = Files.FILE_A; file <= Files.FILE_H; file++) {
            sq = GetSquare(file, rank);
            if (SqAttacked(sq, Colours.BLACK)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
}

export function PrintPieceLists() {    
    console.log("PIECES: ");
    for (let piece = Pieces.W_PAWN; piece <= Pieces.B_KNIGHT; piece++) {
        for (let numPieces = 0; numPieces < GameBoard.numPieces[piece]; numPieces++) {
            console.log(PIECE_CHAR[piece] + " on " + PrSq(GameBoard.pList[PieceIndex(piece, numPieces)]));
        }
    }
}

export function PrintMoveList() {
    var moveCnt = 0;
    for (let i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply+1]; i++) {
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