import { getFileFromChar, getRankFromChar, getSquare } from '../shared/utils';
import { stdin as input, stdout as output } from 'node:process';
import { Color } from '../shared/enums';
import Move from '../game/move';
import { createInterface } from 'readline';

export function getSideInput(): Promise<Color> {
    return new Promise((resolve, reject) => {
        let side = Color.none;
        const rl = createInterface({ input, output });
        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line', (line: string) => {
            line = line.trim().toLowerCase();
            if (line === 'w' || line === 'white') {
                side = Color.white;
                rl.close();
                return;
            }
            if (line === 'b' || line === 'black') {
                side = Color.black;
                rl.close();
                return;
            }
            if (line === 'both') {
                side = Color.none;
                rl.close();
                return;
            }
            
            console.log('Invalid input.');
            rl.prompt();
        });

        rl.on('close', () => {
            resolve(side);
        });
    });
}

export function getMoveInput(moves: Move[]) {
    const moveEx = /[a-h][1-9]/g;

    return new Promise<Move>((resolve, reject) => {
        let userMove = Move.noMove();
        const rl = createInterface({ input, output });
        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line', (line: string) => {
            line = line.trim().toLowerCase();
            if (line === 'e' || line === 'exit') { rl.close(); return; }

            if (/^\d*$/.test(line)) {
                userMove = moves[parseInt(line)];
                rl.close();
                return;
            }

            const tokens = line.match(moveEx) || [];
            if (tokens.length !== 2) {
                console.log(`Invalid input`);
                rl.prompt();
                return;
            }

            userMove = new Move(sqFromString(tokens[0]), sqFromString(tokens[1]));
            let valid = false;
            for (const move of moves) {
                if (JSON.stringify(userMove) === JSON.stringify(move)) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                console.log(`Invalid move`);
                rl.prompt();
                return;
            }

            rl.close();
        });

        rl.on('close', () => {
            resolve(userMove);
        });
    });
}

export function pauseForInput() {
    return new Promise<void>((resolve, reject) => {
        const rl = createInterface({ input, output });
        rl.question("", _ => {
            rl.close();
            resolve();
        });
    });
}

function sqFromString(sq: string) {
    return getSquare(getFileFromChar(sq[0]), getRankFromChar(sq[1]));
}