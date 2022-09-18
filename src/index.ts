import { CASTLE_TEST_FEN, EN_PAS_TEST_FEN, START_FEN } from "./shared/constants";
import { printBoard, printBoardVars } from "./cli/printing";
import Board from "./board/board";
import MoveManager from "./game/move-manager";
import { Square } from "./shared/enums";
import { parseFen } from "./board/board-setup";
import getMoveInput from "./cli/input";

const board = new Board();
const moveManager = new MoveManager(board);
parseFen(board, START_FEN);

while(true) {
    printBoard(board);
    printBoardVars(board);
    moveManager.generateMoves();
    const move = await getMoveInput(moveManager.moveList[board.ply]);
    if (move.isNoMove()) break;
    board.movePiece(move.from, move.to);
}