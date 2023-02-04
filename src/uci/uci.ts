import { stdin as input, stdout as output } from 'node:process';
import { pieceFromString, sqFromString } from '../shared/utils';
import Board from "../board/board";
import Move from '../game/move';
import MoveGenerator from "../game/move-generator";
import { START_FEN } from "../shared/constants";
import Search from "../intelligence/search";
import { createInterface } from 'readline';
import { parseFen } from "../board/board-setup";

export default function runUci(): Promise<void> {
    return new Promise((resolve, reject) => {
        const board = new Board();
        const moveGenerator = new MoveGenerator(board);
        const search = new Search(board, moveGenerator);
        const rl = createInterface({ input, output });
        const sqEx = /[a-h][1-9]/g;
        const promotionEx = /[qrbn]$/i;

        let isNewGame = false;
        let moveList: Move[] = [];
        let gameStartPos = START_FEN;

        rl.on('line', (line: string) => {
            const tokens = line.trim().split(" ");

            switch(tokens[0]) {
                case "uci":
                    console.log("id name Lucida");
                    console.log("id author Bryn Deering");
                    // send options that can be changed
                    console.log("uciok");
                    break;
                case "debug":
                    // set debug mode (on | off)
                    break;
                case "setoption":
                    // set options
                    break;
                case "isready":
                    console.log("readyok");
                    break;
                case "ucinewgame":
                    // this command is not always supported
                    // next position command should call parseFen
                    isNewGame = true;
                    moveList = [];
                    // transposition table should be cleared
                    break;
                case "position":
                {
                    const position = tokens[1] === "startpos" ? START_FEN : tokens[1];
                    if (isNewGame || position !== gameStartPos) {
                        parseFen(board, position);
                        gameStartPos = position;
                        isNewGame = false;
                    }

                    if (tokens.length === 2) break;
                    for (const moveStr of tokens.slice(2)) {
                        const sqTokens = moveStr.match(sqEx);
                        if (!sqTokens) break;
                        const promoteToken = moveStr.match(promotionEx);

                        const move = new Move(sqFromString(sqTokens[0]), sqFromString(sqTokens[1]));
                        if (promoteToken) move.promotion = pieceFromString(promoteToken[0]);

                        if (moveList.length === 0 || !move.equals(moveList[moveList.length - 1])) {
                            board.makeMove(move);
                            moveList.push(move);
                        }
                    }
                    break;
                }
                case "go":
                {
                    // parse go command
                    const [move, score] = search.getBestMove(false);
                    console.log(`bestmove ${move}`);
                    break;
                }
                case "quit":
                    rl.close();
                    break;
                default:
                    break;
            }
        });

        rl.on('close', () => {
            resolve();
        });
    });
}