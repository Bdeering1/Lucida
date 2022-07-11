import { createBoard } from "./board/board-setup";
import { printBoard } from "./cli/printing";

const board = createBoard();
printBoard(board);

board.generatePosKey();