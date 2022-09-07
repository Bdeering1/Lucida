import MoveManager, { Move } from "./board/move-manager";
import { START_FEN } from "./shared/constants";
import { printBoard, printBoard120, printBoardVars } from "./cli/printing";
import { Square } from "./shared/enums";
import Board from "./board/board";
import { parseFen } from "./board/board-setup";

const board = new Board();
parseFen(board, START_FEN);
printBoard(board);
printBoardVars(board);

const moveManager = new MoveManager(board);
moveManager.generateMoves();