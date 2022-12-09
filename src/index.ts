import { Color, InputOption } from "./shared/enums";
import { getMoveInput, getSideInput, pauseForInput } from "./cli/input";
import { printBoard, printBoardVars, printEval, printMoves } from "./cli/printing";
import Board from "./board/board";
import MiniMax from "./intelligence/search";
import Move from "./game/move";
import MoveManager from "./game/move-manager";
import { START_FEN } from "./shared/constants";
import { getGameStatus } from "./game/game-state";
import { parseFen } from "./board/board-setup";


const board = new Board();
const moveManager = new MoveManager(board);
const miniMax = new MiniMax(board, moveManager);
parseFen(board, START_FEN);

console.log("Please chooce a side (white or black)");
const playerColor = await getSideInput();

while(true) {
    printBoard(board);
    printBoardVars(board);
    printEval(board, moveManager, true);
    console.log();

    const status = getGameStatus(board, moveManager.generateMoves());
    if (status.complete) {
        console.log(status.desc);
        break;
    }

    let move: Move | InputOption;
    let score = 0;
    if (playerColor !== Color.none && board.sideToMove !== playerColor) {
        [move, score] = miniMax.getBestMove();
        console.log(`Computer move: ${move} eval: ${score}`);
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