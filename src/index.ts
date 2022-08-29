import { createBoard, parseFen } from "./board/board-setup";
import MoveManager, { Move } from "./board/move-generator";
import { START_FEN } from "./shared/constants";
import { printBoard120 } from "./cli/printing";
import { Square } from "./shared/enums";

const board = createBoard();
parseFen(board, START_FEN);
printBoard120(board);

const moveManager = new MoveManager(board);
moveManager.generateMoves();