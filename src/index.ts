import { createBoard, parseFen } from "./board/board-setup";
import MoveManager, { Move } from "./board/move-generator";
import { START_FEN } from "./shared/constants";
import { printBoard120 } from "./cli/printing";
import { Square } from "./shared/enums";

const board = createBoard();
parseFen(board, START_FEN);
printBoard120(board);

const moveManager = new MoveManager(board);

board.movePiece(Square.e2, Square.e4);
board.updatePositionKey();
board.movePiece(Square.e7, Square.e5);
board.updatePositionKey();
printBoard120(board);
moveManager.generateMoves();