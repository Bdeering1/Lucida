import { Color, InputOption, Square } from "../shared/enums";
import { getMoveInput, getSideInput, pauseForInput } from "./input";
import { getSquareString, printBoard, printBoardVars, printEval, printMoves } from "./printing";
import Board from "../board/board";
import Move from "../game/move";
import MoveGenerator from "../game/move-generator";
import Search from "../intelligence/search";
import { getGameStatus } from "../game/game-state";
import { parseFen } from "../board/board-setup";
import { PIECE_CHAR, START_FEN } from "../shared/constants";
import AttackTable from "../board/attack-table";
import { GetSq120, GetSq64 } from "../shared/utils";

export default async function runCli() {
    const board = new Board();
    const moveGenerator = new MoveGenerator(board);
    const search = new Search(board, moveGenerator);
    const moveList: Move[] = [];
    
    //parseFen(board, `r2qk2r/ppp2p1p/2n5/3pP1p1/3P1p2/B1PB1RnP/P1P3P1/1R1Q2K1 b kq - 3 13`);
    //parseFen(board, '2kr1b1r/ppp2ppp/8/4nb2/3nP3/1B3PB1/PP4PP/RN3KNR b - - 2 13');
    //parseFen(board, 'r5k1/pp4r1/2p1bR2/8/4p3/4Q3/1PP5/2K5 w - - 0 32'); // breaks board representation
    //parseFen(board, 'r2q1rk1/pp3ppp/2p2n2/2b1p3/3nP1b1/2NBB3/PPPQNPPP/2KR3R b - - 7 10'); // takes 0.25s on depth 1
    parseFen(board, START_FEN);

    printBoard(board); 

    console.log(`e2 = ${GetSq64[Square.e2]} (sq64)`);
    for (const sq of (board.attackTable as AttackTable).whitePieceAttacks[GetSq64[Square.e2]].getSmallestAttacker(GetSq64[Square.e2])) {
        console.log(`e2 attacked by ${PIECE_CHAR[board.getPiece(GetSq120[sq])]} on ${getSquareString(GetSq120[sq])} (${sq})`);
    }
    
    // console.log("Please chooce a side (white or black)");
    // const playerColor = await getSideInput();
    
    // while(true) {
    //     printBoard(board);
    //     printBoardVars(board);
    //     printEval(board, moveGenerator, true);
    //     console.log();
    
    //     const status = getGameStatus(board, moveGenerator.generateMoves());
    //     if (status.complete) {
    //         console.log(status.desc);
    //         break;
    //     }
    
    //     let move: Move | InputOption;
    //     let score = 0;
    //     if (playerColor !== Color.none && board.sideToMove !== playerColor) {
    //         [move, score] = search.getBestMove(true);
    //         console.log(`\nMove: ${move} (eval: ${score})`);
    //         await pauseForInput();
    //     }
    //     else {
    //         printMoves([...moveGenerator.getCurrentMoves()]);
    //         move = await getMoveInput([...moveGenerator.getCurrentMoves()]);
    //     }
    
    //     if (move === InputOption.undo) {
    //         if (moveList.length === 0) continue;
    //         board.undoMove(moveList.pop()!);
    //         if (playerColor !== Color.none && moveList.length !== 0) board.undoMove(moveList.pop()!);
    //         continue;
    //     }
    //     if (move === InputOption.exit) break;
    
    //     moveList.push(move);
    //     board.makeMove(move);
    // }
}