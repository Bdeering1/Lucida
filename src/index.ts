import { createBoard, parseFen } from "./board/board-setup";
import { MAX_NUM_PER_PIECE, START_FEN } from "./shared/constants";
import { printBoard120 } from "./cli/printing";
import { Piece, Square } from "./shared/enums";

const board = createBoard();
parseFen(board, START_FEN);
printBoard120(board);