import { GetFileFromChar, GetRankFromChar, GetSquare } from '../board/board-utils';
import { stdin as input, stdout as output } from 'node:process';
import { IBoard } from "../board/board-types";
import { Square } from '../shared/enums';
import { createInterface } from 'readline';
import { printBoard } from './printing';

const rl = createInterface({ input, output });

export default async function getInput(board: IBoard) {
    printBoard(board);
    getMoveInput(board);
}

function getMoveInput(board: IBoard) {
    const moveEx = /^[a-h][1-9]\b/i;
    let from = Square.none;
    let to = Square.none;

    rl.setPrompt('Enter sq > ');
    rl.prompt();
    rl.on('line', (line: string) => {
        if (!moveEx.test(line.trim())) {
            console.log("Invalid move");
            return;
        }
        if (from === Square.none) from = sqFromString(line);
        else to = sqFromString(line);
        rl.close();
    });
    board.movePiece(from, to);
}

function sqFromString(sq: string) {
    return GetSquare(GetFileFromChar(sq[0]), GetRankFromChar(sq[1]));
}