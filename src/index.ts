import MoveManager, { Move } from "./game/move-manager";
import { getMoveInput, getSideInput, pauseForInput } from "./cli/input";
import { printBoard, printBoardVars, printMoves } from "./cli/printing";
import Board from "./board/board";
import { Color } from "./shared/enums";
import NegaMax from "./intelligence/nega-max";
import { START_FEN } from "./shared/constants";
import { getGameStatus } from "./game/game-state";
import { parseFen } from "./board/board-setup";

const board = new Board();
const moveManager = new MoveManager(board);
const negaMax = new NegaMax(board, moveManager);
parseFen(board, START_FEN);

console.log("Please chooce a side (white or black)");
const playerColor = await getSideInput();

while(true) {
    printBoard(board);
    printBoardVars(board);
    const status = getGameStatus(board, moveManager.generateMoves());
    if (status.complete) {
        console.log(status.desc);
        break;
    }

    let move: Move;
    if (playerColor !== Color.none && board.sideToMove !== playerColor) {
        move = negaMax.getBestMove();
        console.log(`Computer move: ${move}`);
        await pauseForInput();
    }
    else {
        printMoves(board, moveManager);
        move = await getMoveInput(moveManager.currentMoves);
    }

    if (move.isNoMove()) break;
    board.movePiece(move.from, move.to);
}