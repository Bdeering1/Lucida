import { stdin as input, stdout as output } from 'node:process';
import { pieceFromString, sqFromString } from '../shared/utils';
import Board from "../board/board";
import Move from '../game/move';
import MoveGenerator from "../game/move-generator";
import { START_FEN } from "../shared/constants";
import Search from "../intelligence/search";
import { createInterface } from 'readline';
import { parseFen } from "../board/board-setup";
import runCli from '../cli/cli-game';
import { Verbosity } from '../shared/enums';

export default function runUci(): Promise<void> {
    return new Promise((resolve, reject) => {
        const board = new Board();
        const moveGenerator = new MoveGenerator(board);
        const search = new Search(board, moveGenerator);
        const rl = createInterface({ input, output });
        const sqEx = /[a-h][1-9]/g;
        const promotionEx = /[qrbn]$/i;

        let isDebug = false;
        let isNewGame = false;
        let moveList: Move[] = [];
        let gameStartPos = "";

        rl.on('line', async (line: string) => {
            const tokens = line.trim().split(" ");

            switch(tokens[0]) {
                case "cli":
                    rl.close();
                    await runCli();
                    break;
                case "uci":
                    console.log("id name Lucida");
                    console.log("id author Bryn Deering");
                    // send options that can be changed
                    console.log("uciok");
                    break;
                case "debug":
                    isDebug = tokens[1] === "on";
                    if (isDebug) console.log(`info string received debug command (${tokens.length - 1} args)`);
                    break;
                case "setoption":
                    if (isDebug) console.log(`info string received setoption command (${tokens.length - 1} args)`);
                    // set options
                    break;
                case "isready":
                    console.log("readyok");
                    break;
                case "ucinewgame": // note: this command is not always supported
                    if (isDebug) console.log("info string received ucinewgame command");
                    isNewGame = true;
                    moveList = [];
                    moveGenerator.transpositionTable.clear();
                    break;
                case "position":
                {
                    if (isDebug) console.log(`info string received position command (${tokens.length - 1} args)`);
                    const position = tokens[1] === "startpos" ? START_FEN : tokens[1];
                    if (isNewGame || position !== gameStartPos) {
                        if (isDebug) console.log(`info string parsing new position: '${position}'`);
                        parseFen(board, position);
                        gameStartPos = position;
                        isNewGame = false;
                    }

                    if (tokens.length === 2) break;
                    tokens.slice(2).forEach((moveStr, idx) => {
                        const sqTokens = moveStr.match(sqEx);
                        if (!sqTokens) return;
                        const promoteToken = moveStr.match(promotionEx);

                        const move = new Move(sqFromString(sqTokens[0]), sqFromString(sqTokens[1]));
                        if (promoteToken) move.promotion = pieceFromString(promoteToken[0]);

                        if (moveList.length < idx + 1 || !move.equals(moveList[idx])) {
                            if (isDebug) console.log(`info string made move: ${move}`);
                            board.makeMove(move);
                            moveList.push(move);
                        }
                    });
                    break;
                }
                case "go":
                {
                    const verbosity = isDebug ? Verbosity.debug : Verbosity.normal;
                    if (isDebug) console.log(`info string received go command (${tokens.length - 1} args)`);
                    let move: Move;
                    let subCommand = tokens.length > 1 ? tokens[1] : "";
                    switch(tokens[1]) {
                        case "depth":
                            [move,] = search.getBestMove(verbosity, parseInt(tokens[2]));
                            break;
                        case "searchmoves":
                        case "ponder":
                        case "wtime":
                        case "btime":
                        case "winc":
                        case "binc":
                        case "movestogo":
                        case "nodes":
                        case "mate":
                        case "movetime":
                        case "infinite":
                        default:
                            [move,] = search.getBestMove(verbosity);
                            break;
                    }
                    console.log(`bestmove ${move}`);
                    break;
                }
                case "ponderhit":
                    // use has played expected move, transition to normal search
                    break;
                case "stop":
                    // stop calculating as soon as possible
                    // send the 'bestmove' and possibly the 'ponder' token
                    break;
                case "quit":
                    rl.close();
                    break;
                default:
                    console.log(`info string received unknown command: '${tokens[0]}'`);
                    break;
            }
        });

        rl.on('close', () => {
            resolve();
        });
    });
}