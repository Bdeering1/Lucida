import { printBoard, printBoardVars, printMoves } from "./cli/printing";
import Board from "./board/board";
import MoveManager from "./game/move-manager";
import { START_FEN } from "./shared/constants";
import { getGameStatus } from "./game/game-state";
import getMoveInput from "./cli/input";
import { parseFen } from "./board/board-setup";

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