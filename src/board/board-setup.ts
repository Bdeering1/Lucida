import { Color, File, Piece, Rank } from "../shared/enums";
import { getFileFromChar, getRankFromChar, getSquare } from "../shared/utils";
import { IBoard } from "./board-types";

export function resetBoard(): void {
    throw new Error("Method not implemented.");
}

export function parseFen(board: IBoard, fen: string): void {
    const tokens = fen.split(' ');
    if (tokens.length > 6) return; // invalid FEN
    const [ pieces, side, castling, enPas, fiftyMove, ply ] = tokens;
    
    let idx = 0;
    let file = File.a;
    let rank = Rank.eight;
    while (rank >= Rank.one && idx < fen.length) {
        switch (pieces[idx]) {
            case 'P':
                board.addPiece(Piece.whitePawn, getSquare(file, rank));
                break;
            case 'N':
                board.addPiece(Piece.whiteKnight, getSquare(file, rank));
                break;
            case 'B':
                board.addPiece(Piece.whiteBishop, getSquare(file, rank));
                break;
            case 'R':
                board.addPiece(Piece.whiteRook, getSquare(file, rank));
                break;
            case 'Q':
                board.addPiece(Piece.whiteQueen, getSquare(file, rank));
                break;
            case 'K':
                board.addPiece(Piece.whiteKing, getSquare(file, rank));
                break;
            case 'p':
                board.addPiece(Piece.blackPawn, getSquare(file, rank));
                break;
            case 'n':
                board.addPiece(Piece.blackKnight, getSquare(file, rank));
                break;
            case 'b':
                board.addPiece(Piece.blackBishop, getSquare(file, rank));
                break;
            case 'r':
                board.addPiece(Piece.blackRook, getSquare(file, rank));
                break;
            case 'q':
                board.addPiece(Piece.blackQueen, getSquare(file, rank));
                break;
            case 'k':
                board.addPiece(Piece.blackKing, getSquare(file, rank));
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                file += parseInt(fen[idx]) - 1;
                break;
            case '/':
                rank--;
                file = File.a;
                idx++;
                continue;
        }
        idx++;
        file++;
    }

    board.sideToMove = side === 'w' ? Color.white : Color.black;

    for (let i = 0; i < castling.length; i++) {
        switch (castling[i]) {
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
    }

    if (enPas !== '-') {
        file = getFileFromChar(enPas[0]);
        rank = getRankFromChar(enPas[1]);
        board.enPas = getSquare(file, rank);
    }

    board.fiftyMoveCounter = parseInt(fiftyMove);
    board.ply = (parseInt(ply) - 1) * 2 + board.sideToMove;

    board.updatePositionKey();
}