import Board from "../board/board";
import MoveGenerator from "../game/move-generator";
import Search from "../intelligence/search";
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'readline';
import { START_FEN } from "../shared/constants";
import { parseFen } from "../board/board-setup";

export default function runUci(): Promise<void> {
    return new Promise((resolve, reject) => {
        const board = new Board();
        const moveGenerator = new MoveGenerator(board);
        const search = new Search(board, moveGenerator);
        const rl = createInterface({ input, output });
        const moveEx = /[a-h][1-9]/g;

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
                    // next position command should call parseFen (not always supported)
                    break;
                case "position":
                    const position = tokens[1] === "startpos" ? START_FEN : tokens[1];
                    parseFen(board, position);
                    if (tokens.length == 2) break;
                    for (const move of tokens.slice(3)) {
                        // parse and make move
                    }
                    break;
                case "go":
                    // parse go command
                    const [move, score] = search.getBestMove(false)
                    console.log(`bestmove ${move}`);
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