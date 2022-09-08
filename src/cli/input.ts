import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'node:process';
import { IBoard } from "../board/board-types";

const rl = createInterface({ input, output });

export default function getInput(board: IBoard) {
    getMoveInput();
}

function getMoveInput() {
    const moveEx = /^[a-h][1-9]\b/i;

    rl.on('line', (line: string) => {
        if (!moveEx.test(line.trim())) {
            console.log("Invalid move");
            return;
        }
        rl.close();
    });
}