import MoveManager, { Move } from "./board/move-manager";
import { CASTLE_TEST_FEN, START_FEN } from "./shared/constants";
import { printBoard, printBoard120, printBoardVars } from "./cli/printing";
import { Square } from "./shared/enums";
import Board from "./board/board";
import { parseFen } from "./board/board-setup";

const board = new Board();
parseFen(board, CASTLE_TEST_FEN);
board.movePiece(Square.e1, Square.g1);
board.movePiece(Square.e8, Square.g8);
printBoard(board);
printBoardVars(board);

const moveManager = new MoveManager(board);
moveManager.generateMoves();