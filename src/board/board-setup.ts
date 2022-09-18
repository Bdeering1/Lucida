import { Color, File, Piece, Rank } from "../shared/enums";
import { GetFileFromChar, GetRankFromChar, GetSquare } from "../shared/utils";
import { IBoard } from "./board-types";

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
                file += parseInt(fen[fenIdx]) - 1;
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

    board.sideToMove = fen[fenIdx] === 'w' ? Color.white : Color.black;
    fenIdx += 2;

    while (fen[fenIdx] !== ' ') {
        switch (fen[fenIdx]) {
            case 'K':
                board.setWhiteKingCastle();
                break;
            case 'Q':
                board.setWhiteQueenCastle();
                break;
            case 'k':
                board.setBlackKingCastle();
                break;
            case 'q':
                board.setBlackQueenCastle();
                break;
            default:
                break;
        }
        fenIdx++;
    }
    fenIdx++;

    if (fen[fenIdx] !== '-') {
        file = GetFileFromChar(fen[fenIdx++]);
        rank = GetRankFromChar(fen[fenIdx]);
        board.enPas = GetSquare(file, rank);
    }
    fenIdx += 2;

    board.fiftyMoveCounter = parseInt(fen[fenIdx]);
    fenIdx += 2;
    board.ply = (parseInt(fen[fenIdx]) - 1) * 2 + board.sideToMove;

    board.updatePositionKey();
}