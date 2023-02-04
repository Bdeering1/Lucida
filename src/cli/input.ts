import { Color, InputOption } from '../shared/enums';
import { stdin as input, stdout as output } from 'node:process';
import Move from '../game/move';
import { createInterface } from 'readline';
import { sqFromString } from '../shared/utils';

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
    const sqEx = /[a-h][1-9]/g;

    return new Promise<Move | InputOption>((resolve, reject) => {
        let userMove: Move | InputOption;
        const rl = createInterface({ input, output });
        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line', (line: string) => {
            userMove = InputOption.exit;
            line = line.trim().toLowerCase();
            if (line === 'e' || line === 'exit' || line === 'q' || line === 'quit') { rl.close(); return; }
            if (line === 'u' || line === 'undo') { userMove = InputOption.undo; rl.close(); return; }

            if (/^\d+$/.test(line)) {
                userMove = moves[parseInt(line)];
                rl.close();
                return;
            }

            const sqTokens = line.match(sqEx) || [];
            if (sqTokens.length !== 2) {
                console.log(`Invalid input`);
                rl.prompt();
                return;
            }

            userMove = new Move(sqFromString(sqTokens[0]), sqFromString(sqTokens[1]));
            let valid = false;
            for (const move of moves) {
                if (userMove.equals(move)) {
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