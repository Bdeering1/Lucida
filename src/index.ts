import MoveManager, { Move } from "./board/move-manager";
import { START_FEN } from "./shared/constants";
import { printBoard120 } from "./cli/printing";
import { Square } from "./shared/enums";
import Board from "./board/board";
import { parseFen } from "./board/board-setup";

const board = new Board();
parseFen(board, 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
printBoard120(board);

const moveManager = new MoveManager(board);
moveManager.generateMoves();