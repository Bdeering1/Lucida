import { GetFileFromChar, GetRankFromChar, GetSquare } from '../board/board-utils';
import { stdin as input, stdout as output } from 'node:process';
import { IBoard } from "../board/board-types";
import { Square } from '../shared/enums';
import { createInterface } from 'readline';
import { getSquareString, printBoard } from './printing';

export default async function getInput(board: IBoard) {
    return await getMoveInput(board);
}

function getMoveInput(board: IBoard) {
    const moveEx = /[a-h][1-9]/g;
    let from = Square.none;
    let to = Square.none;

    return new Promise<boolean>((resolve, reject) => {
        let cont = true;
        const rl = createInterface({ input, output });
        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line', (line: string) => {
            line = line.trim().toLowerCase();
            if (line === 'e' || line === 'exit') {
                cont = false;
                rl.close();
                return;
            }
            const tokens = line.match(moveEx) || [];
            if (tokens.length !== 2) {
                console.log(`Invalid move ${line.match(moveEx)}`);
                return;
            }
            from = sqFromString(tokens[0]);
            to = sqFromString(tokens[1]);
            board.movePiece(from, to);
            rl.close();
        });

        rl.on('close', () => {
            resolve(cont);
        });
    });
}

function sqFromString(sq: string) {
    return GetSquare(GetFileFromChar(sq[0]), GetRankFromChar(sq[1]));
}