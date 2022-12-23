import { Color, InputOption } from "./shared/enums";
import { getMoveInput, getSideInput, pauseForInput as pauseConsole } from "./cli/input";
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
const moveList: Move[] = [];
parseFen(board, `r2qk2r/ppp2p1p/2n5/3pP1p1/3P1p2/B1PB1RnP/P1P3P1/1R1Q2K1 b kq - 3 13`);

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
        console.log(`\nMove: ${move} (eval: ${score})`);
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