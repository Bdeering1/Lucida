import { Color, InputOption } from "./shared/enums";
import { getMoveInput, getSideInput, pauseForInput as pauseConsole } from "./cli/input";
import { printBoard, printBoardVars, printEval, printMoves } from "./cli/printing";
import Board from "./board/board";
import Search from "./intelligence/search";
import Move from "./game/move";
import MoveGenerator from "./game/move-generator";
import { START_FEN } from "./shared/constants";
import { getGameStatus } from "./game/game-state";
import { parseFen } from "./board/board-setup";


const board = new Board();
const moveGenerator = new MoveGenerator(board);
const search = new Search(board, moveGenerator);
const moveList: Move[] = [];

parseFen(board, `r2qk2r/ppp2p1p/2n5/3pP1p1/3P1p2/B1PB1RnP/P1P3P1/1R1Q2K1 b kq - 3 13`);
//parseFen(board, START_FEN);

console.log("Please chooce a side (white or black)");
const playerColor = await getSideInput();

while(true) {
    printBoard(board);
    printBoardVars(board);
    printEval(board, moveGenerator, false);
    console.log();

    const status = getGameStatus(board, moveGenerator.generateMoves());
    if (status.complete) {
        console.log(status.desc);
        break;
    }

    let move: Move | InputOption;
    let score = 0;
    if (playerColor !== Color.none && board.sideToMove !== playerColor) {
        [move, score] = search.getBestMove(true);
        console.log(`\nMove: ${move} (eval: ${score})`);
        await pauseConsole();
    }
    else {
        printMoves([...moveGenerator.getCurrentMoves()]);
        move = await getMoveInput([...moveGenerator.getCurrentMoves()]);
    }

    if (move === InputOption.undo) {
        if (moveList.length === 0) continue;
        board.undoMove(moveList.pop()!);
        if (playerColor !== Color.none && moveList.length !== 0) board.undoMove(moveList.pop()!);
        continue;
    }
    if (move === InputOption.exit) break;

    moveList.push(move);
    board.makeMove(move);
}