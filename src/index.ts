import { createBoard, parseFen } from "./board/board-setup";
import MoveManager, { Move } from "./board/move-manager";
import { START_FEN } from "./shared/constants";
import { printBoard120 } from "./cli/printing";
import { Square } from "./shared/enums";

const board = createBoard();
parseFen(board, 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
printBoard120(board);

const moveManager = new MoveManager(board);
moveManager.generateMoves();