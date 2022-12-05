import { getMoveInput, getSideInput, pauseForInput } from "./cli/input";
import { printBoard, printBoardVars, printMoves } from "./cli/printing";
import Board from "./board/board";
import { Color } from "./shared/enums";
import MiniMax from "./intelligence/mini-max";
import Move from "./game/move";
import MoveManager from "./game/move-manager";
import { BOARD_SQ_NUM, START_FEN } from "./shared/constants";
import { getGameStatus } from "./game/game-state";
import { parseFen } from "./board/board-setup";
import PieceSquareTables from "./intelligence/pst";

// PieceSquareTables.init();

// let out = '';
// for (let sq = 0; sq < BOARD_SQ_NUM; sq++) {
//     out += `${PieceSquareTables.whiteRook[sq].toString().padStart(3, " ")} `;
//     if ((sq + 1) % 10 === 0) out += '\n';
// }
// console.log(out);

const board = new Board();
const moveManager = new MoveManager(board);
const miniMax = new MiniMax(board, moveManager);
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
        move = miniMax.getBestMove();
        console.log(`Computer move: ${move}`);
        await pauseForInput();
    }
    else {
        printMoves(board, moveManager);
        move = await getMoveInput([...moveManager.getCurrentMoves()]);
    }

    if (move.isNoMove()) break;
    board.movePiece(move.from, move.to, move.promotion);
}