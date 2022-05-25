import { GameBoard, SqAttacked } from "../board/board";
import { FILE_CHAR, RANK_CHAR, PIECE_CHAR, SIDE_CHAR, CastleBit, Colour, File, Piece, Rank } from "../shared/constants";
import { FromSq, ToSq, GetSquare, PieceIndex, Promoted, BoardUtils } from "../shared/utils";


export function PrintSquare(sq : number) {
    return (FILE_CHAR[BoardUtils.FilesBoard[sq]] + RANK_CHAR[BoardUtils.RanksBoard[sq]]);
}

export function PrintMove(move : number) {
    let moveStr : string;
    
    const fileFrom = BoardUtils.FilesBoard[FromSq(move)];
    const rankFrom = BoardUtils.RanksBoard[FromSq(move)];
    const fileTo = BoardUtils.FilesBoard[ToSq(move)];
    const rankTo = BoardUtils.RanksBoard[ToSq(move)];
   
    moveStr = FILE_CHAR[fileFrom] + RANK_CHAR[rankFrom] + FILE_CHAR[fileTo] + RANK_CHAR[rankTo];
    
    const promoted = Promoted(move);
    if (promoted != Piece.empty) {
        moveStr += PIECE_CHAR[promoted].toLowerCase();
    }
    
    return moveStr;
}

export function PrintBoard() { /*Gameboard: pieces, side, enPas, castlePerm, posKey*/
    let sq : number;
    let piece : Piece;
    let line : string;

    for (let rank = Rank.eight; rank >= Rank.one; rank--) {
        line = (RANK_CHAR[rank] + " ");
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PIECE_CHAR[piece] + " ");
        }
        console.log(line);
    }
    line = "  ";
    for (let file = File.a; file <= File.h; file++) {
        line += (" " + FILE_CHAR[file] + " ");
    }
    console.log(line);
    
    console.log("Side: " + SIDE_CHAR[GameBoard.side]);
    console.log("En Pas: " + GameBoard.enPas);
    
    line = "";
    if (GameBoard.castlePerm & CastleBit.whiteKing) line += 'K'; // AND mask to retrieve each bit in castlePerm
    if (GameBoard.castlePerm & CastleBit.whiteQueen) line += 'Q'; 
    if (GameBoard.castlePerm & CastleBit.blackKing) line += 'k'; 
    if (GameBoard.castlePerm & CastleBit.blackQueen) line += 'q';
    console.log("Castle: " + line);
    console.log("Key: " + GameBoard.posKey.toString(16) + "\n\n");
}

export function PrintSquaresAttacked() {
    let sq : number;
    let piece : string;
    
    console.log("\nSquares attacked by white: \n");
    for (let rank = Rank.eight; rank >= Rank.one; rank--) { // going from the backrank so that it prints nicely
        let line = (RANK_CHAR[rank] + "  ");
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file, rank);
            if (SqAttacked(sq, Colour.white)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
    
    console.log("Squares attacked by black: \n");
    for (let rank = Rank.eight; rank >= Rank.one; rank--) { // going from the backrank so that it prints nicely
        let line = (RANK_CHAR[rank] + "  ");
        for (let file = File.a; file <= File.h; file++) {
            sq = GetSquare(file, rank);
            if (SqAttacked(sq, Colour.black)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
}

export function PrintPieceLists() {    
    console.log("PIECES: ");
    for (let piece = Piece.whitePawn; piece <= Piece.blackKnight; piece++) {
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