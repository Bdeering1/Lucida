import { CASTLE_TEST_FEN, EN_PAS_TEST_FEN, START_FEN } from "./shared/constants";
import { printBoard, printBoardVars } from "./cli/printing";
import Board from "./board/board";
import MoveManager from "./board/move-manager";
import { Square } from "./shared/enums";
import { parseFen } from "./board/board-setup";
import getInput from "./cli/input";

const board = new Board();
parseFen(board, START_FEN);

let running = true;
while(running) {
    printBoard(board);
    running = await getInput(board);
}

// printBoard(board);
// printBoardVars(board);

// const moveManager = new MoveManager(board);
// console.log(moveManager.generateMoves());