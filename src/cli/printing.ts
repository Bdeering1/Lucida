import { GameBoard, SqAttacked } from "../board/board";
import { FILE_CHAR, RANK_CHAR, PIECE_CHAR, SIDE_CHAR, CastleBit, Colours, Files, Pieces, Ranks } from "../shared/constants";
import { FilesBoard, RanksBoard, FromSq, ToSq, GetSquare, PieceIndex, Promoted } from "../shared/utils";


export function PrintSquare(sq : number) {
    return (FILE_CHAR[FilesBoard[sq]] + RANK_CHAR[RanksBoard[sq]]);
}

export function PrintMove(move : number) {
    let moveStr : string;
    
    let fileFrom = FilesBoard[FromSq(move)];
    let rankFrom = RanksBoard[FromSq(move)];
    let fileTo = FilesBoard[ToSq(move)];
    let rankTo = RanksBoard[ToSq(move)];
   
    moveStr = FILE_CHAR[fileFrom] + RANK_CHAR[rankFrom] + FILE_CHAR[fileTo] + RANK_CHAR[rankTo];
    
    let promoted = Promoted(move);
    if (promoted != Pieces.EMPTY) {
        moveStr += PIECE_CHAR[promoted].toLowerCase();
    }
    
    return moveStr;
}

export function PrintBoard() { /*Gameboard: pieces, side, enPas, castlePerm, posKey*/
    let sq : number;
    let piece : Pieces;
    let line : string;

    for (let rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) {
        line = (RANK_CHAR[rank] + " ");
        for (let file = Files.FILE_A; file <= Files.FILE_H; file++) {
            sq = GetSquare(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PIECE_CHAR[piece] + " ");
        }
        console.log(line);
    }
    line = "  ";
    for (let file = Files.FILE_A; file <= Files.FILE_H; file++) {
        line += (" " + FILE_CHAR[file] + " ");
    }
    console.log(line);
    
    console.log("Side: " + SIDE_CHAR[GameBoard.side]);
    console.log("En Pas: " + GameBoard.enPas);
    
    line = "";
    if (GameBoard.castlePerm & CastleBit.W_KING) line += 'K'; // AND mask to retrieve each bit in castlePerm
    if (GameBoard.castlePerm & CastleBit.W_QUEEN) line += 'Q'; 
    if (GameBoard.castlePerm & CastleBit.B_KING) line += 'k'; 
    if (GameBoard.castlePerm & CastleBit.B_QUEEN) line += 'q';
    console.log("Castle: " + line);
    console.log("Key: " + GameBoard.posKey.toString(16) + "\n\n");
}

export function PrintSquaresAttacked() {
    let sq : number;
    let piece : string;
    
    console.log("\nSquares attacked by white: \n");
    for (let rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) { // going from the backrank so that it prints nicely
        let line = (RANK_CHAR[rank] + "  ");
        for (let file = Files.FILE_A; file <= Files.FILE_H; file++) {
            sq = GetSquare(file, rank);
            if (SqAttacked(sq, Colours.WHITE)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
    
    console.log("Squares attacked by black: \n");
    for (let rank = Ranks.RANK_8; rank >= Ranks.RANK_1; rank--) { // going from the backrank so that it prints nicely
        let line = (RANK_CHAR[rank] + "  ");
        for (let file = Files.FILE_A; file <= Files.FILE_H; file++) {
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
            console.log(PIECE_CHAR[piece] + " on " + PrintSquare(GameBoard.pList[PieceIndex(piece, numPieces)]));
        }
    }
}

export function PrintMoveList() {
    let moveCount = 0;
    for (let i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply+1]; i++) {
        console.log(PrintMove(GameBoard.moveList[i]));
        moveCount++;
    }
    
    console.log("\n" + moveCount + " total moves.");
}