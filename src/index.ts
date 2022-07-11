import { createBoard, parseFen } from "./board/board-setup";
import { START_FEN } from "./shared/constants";
import { printBoard } from "./cli/printing";

const board = createBoard();
parseFen(board, START_FEN);
printBoard(board);