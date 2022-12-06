import { Color, InputOption } from "./shared/enums";
import { getMoveInput, getSideInput, pauseForInput } from "./cli/input";
import { printBoard, printBoardVars, printMoves } from "./cli/printing";
import Board from "./board/board";
import MiniMax from "./intelligence/mini-max";
import Move from "./game/move";
import MoveManager from "./game/move-manager";
import { START_FEN } from "./shared/constants";
import { getGameStatus } from "./game/game-state";
import { parseFen } from "./board/board-setup";


const board = new Board();
const moveManager = new MoveManager(board);
const miniMax = new MiniMax(board, moveManager);
parseFen(board, 'r2qk2r/pbp1bpp1/1pn1p2p/3pP3/3P2P1/1NP2N1P/PP1QBP2/R3K2R b KQkq - 3 13');

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

    let move: Move | InputOption;
    if (playerColor !== Color.none && board.sideToMove !== playerColor) {
        move = miniMax.getBestMove();
        console.log(`Computer move: ${move}`);
        await pauseForInput();
    }
    else {
        printMoves(board, moveManager);
        move = await getMoveInput([...moveManager.getCurrentMoves()]);
    }

    if (move === InputOption.undo) {
        board.undoMove();
        board.undoMove();
        continue;
    }
    if (move === InputOption.exit) break;

    board.movePiece(move.from, move.to, move.promotion);
}