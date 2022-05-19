import { GameBoard, SqAttacked } from "./board";
import { FILE_CHAR, RANK_CHAR, PIECE_CHAR, SIDE_CHAR } from "./shared/constants";
import { PIECES, RANKS, FILES, CASTLE_BIT, COLOURS } from "./shared/enums";
import { FilesBoard, RanksBoard, FromSq, ToSq, Promoted, fileRankToSq, PieceIndex } from "./shared/utils";


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
    if (promoted != PIECES.EMPTY) {
        MoveStr += PIECE_CHAR[promoted].toLowerCase();
    }
    
    return MoveStr;
}

export function PrintBoard() { /*Gameboard: pieces, side, enPas, castlePerm, posKey*/
    var sq, file, rank, piece, line;

    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        line = (RANK_CHAR[rank] + " ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = fileRankToSq(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PIECE_CHAR[piece] + " ");
        }
        console.log(line);
    }
    line = "  ";
    for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
        line += (" " + FILE_CHAR[file] + " ");
    }
    console.log(line);
    
    console.log("Side: " + SIDE_CHAR[GameBoard.side]);
    console.log("En Pas: " + GameBoard.enPas);
    
    line = "";
    if (GameBoard.castlePerm & CASTLE_BIT.WKCA) line += 'K'; /*AND mask to retrieve each bit in castlePerm*/
    if (GameBoard.castlePerm & CASTLE_BIT.WQCA) line += 'Q'; 
    if (GameBoard.castlePerm & CASTLE_BIT.BKCA) line += 'k'; 
    if (GameBoard.castlePerm & CASTLE_BIT.BQCA) line += 'q';
    console.log("Castle: " + line);
    console.log("Key: " + GameBoard.posKey.toString(16) + "\n\n");
}

export function PrintSqAttacked() {
    var sq, file, rank, piece;
    
    console.log("\nSquares attacked by white: \n");
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) { /*going from the backrank so that it pxrints nicely*/
        let line = (RANK_CHAR[rank] + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = fileRankToSq(file, rank);
            if (SqAttacked(sq, COLOURS.WHITE)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
    
    console.log("Squares attacked by black: \n");
    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) { /*going from the backrank so that it prints nicely*/
        let line = (RANK_CHAR[rank] + "  ");
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = fileRankToSq(file, rank);
            if (SqAttacked(sq, COLOURS.BLACK)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
}

export function PrintPieceLists() {    
    console.log("PIECES: ");
    for (let piece = PIECES.wP; piece <= PIECES.bK; piece++) {
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