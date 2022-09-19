import { CASTLE_TEST_FEN, EN_PAS_TEST_FEN, START_FEN } from "./shared/constants";
import { printBoard, printBoardVars, printMoves } from "./cli/printing";
import Board from "./board/board";
import MoveManager from "./game/move-manager";
import { parseFen } from "./board/board-setup";
import getMoveInput from "./cli/input";
import { getGameStatus } from "./game/game-state";

const board = new Board();
const moveManager = new MoveManager(board);
parseFen(board, START_FEN);

while(true) {
    printBoard(board);
    printBoardVars(board);
    const status = getGameStatus(board, moveManager.generateMoves());
    printMoves(board, moveManager);
    if (status.complete) {
        console.log(status.desc);
        break;
    }
    const move = await getMoveInput(moveManager.moveList[board.ply]);
    if (move.isNoMove()) break;
    board.movePiece(move.from, move.to);
}