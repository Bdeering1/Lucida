import { Color, InputOption } from "./shared/enums";
import { getMoveInput, getSideInput, pauseForInput as pauseConsole } from "./cli/input";
import { printBoard, printBoardVars, printEval, printMoves } from "./cli/printing";
import Board from "./board/board";
import MiniMax from "./intelligence/search";
import Move from "./game/move";
import MoveManager from "./game/move-manager";
import { START_FEN } from "./shared/constants";
import { SideMultiplier } from "./shared/utils";
import { getGameStatus } from "./game/game-state";
import { parseFen } from "./board/board-setup";


const board = new Board();
const moveManager = new MoveManager(board);
const miniMax = new MiniMax(board, moveManager);
const moveList: Move[] = [];
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
        [move, score] = miniMax.getBestMove(true);
        console.log(`\nMove: ${move} (eval: ${score * SideMultiplier[board.sideToMove]})`);
        await pauseConsole();
    }
    else {
        printMoves([...moveManager.getCurrentMoves()]);
        move = await getMoveInput([...moveManager.getCurrentMoves()]);
    }

    if (move === InputOption.undo) {
        if (moveList.length === 0) continue;
        board.undoMove(moveList.pop() as Move);
        if (playerColor !== Color.none && moveList.length !== 0) board.undoMove(moveList.pop() as Move);
        continue;
    }
    if (move === InputOption.exit) break;

    moveList.push(move);
    board.makeMove(move);
}