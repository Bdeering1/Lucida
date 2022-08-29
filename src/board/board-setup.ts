import { Board, BoardMeta } from "./board";
import { Color, File, Piece, Rank } from "../shared/enums";
import { GetSquare } from "./board-utils";
import { IBoard } from "./board-types";

export function createBoard() {
    return new Board(new BoardMeta());
}

export function resetBoard(): void {
    throw new Error("Method not implemented.");
}

export function parseFen(board: IBoard, fen: string): void {
    let file = File.a;
    let rank = Rank.eight;
    let fenIdx = 0;

    while (rank >= Rank.one && fenIdx < fen.length) {
        switch (fen[fenIdx]) {
            case 'P':
                board.addPiece(Piece.whitePawn, GetSquare(file, rank));
                break;
            case 'N':
                board.addPiece(Piece.whiteKnight, GetSquare(file, rank));
                break;
            case 'B':
                board.addPiece(Piece.whiteBishop, GetSquare(file, rank));
                break;
            case 'R':
                board.addPiece(Piece.whiteRook, GetSquare(file, rank));
                break;
            case 'Q':
                board.addPiece(Piece.whiteQueen, GetSquare(file, rank));
                break;
            case 'K':
                board.addPiece(Piece.whiteKing, GetSquare(file, rank));
                break;
            case 'p':
                board.addPiece(Piece.blackPawn, GetSquare(file, rank));
                break;
            case 'n':
                board.addPiece(Piece.blackKnight, GetSquare(file, rank));
                break;
            case 'b':
                board.addPiece(Piece.blackBishop, GetSquare(file, rank));
                break;
            case 'r':
                board.addPiece(Piece.blackRook, GetSquare(file, rank));
                break;
            case 'q':
                board.addPiece(Piece.blackQueen, GetSquare(file, rank));
                break;
            case 'k':
                board.addPiece(Piece.blackKing, GetSquare(file, rank));
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                file += parseInt(fen[fenIdx]);
                break;
            case '/':
            case ' ':
                rank--;
                file = File.a;
                fenIdx++;
                continue;
        }
        fenIdx++;
        file++;
    }

    board.meta.sideToMove = fen[fenIdx] === 'w' ? Color.white : Color.black;
    fenIdx += 2;

    while (fen[fenIdx] !== ' ' && fen[fenIdx] !== '-') {
        switch (fen[fenIdx]) {
            case 'K':
                board.meta.setWhiteKingCastle();
                break;
            case 'Q':
                board.meta.setWhiteQueenCastle();
                break;
            case 'k':
                board.meta.setBlackKingCastle();
                break;
            case 'q':
                board.meta.setBlackQueenCastle();
                break;
            default:
                break; // something is probably wrong with the FEN
        }
        fenIdx++;
    }
    fenIdx++;

    if (fen[fenIdx] !== '-') {
        file = GetFile(fen[fenIdx++]);
        rank = GetRank(fen[fenIdx++]);
        board.meta.enPas = GetSquare(file, rank);
    }
    fenIdx += 2;

    board.meta.fiftyMoveCounter = parseInt(fen[fenIdx]);
    fenIdx += 2;
    board.meta.ply = parseInt(fen[fenIdx]) * 2;

    board.updatePositionKey();
}

function GetFile(fileStr: string) {
    return fileStr.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

function GetRank(rankStr: string) {
    return rankStr.charCodeAt(0) - '1'.charCodeAt(0) + 1;
}