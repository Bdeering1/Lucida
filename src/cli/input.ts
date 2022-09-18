import { GetFileFromChar, GetRankFromChar, GetSquare } from '../shared/utils';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'readline';
import { Move } from '../game/move-manager';

export default async function getMoveInput(moves: Move[]) {
    const moveEx = /[a-h][1-9]/g;

    return new Promise<Move>((resolve, reject) => {
        let move = Move.NoMove();
        const rl = createInterface({ input, output });
        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line', (line: string) => {
            line = line.trim().toLowerCase();
            if (line === 'e' || line === 'exit') { rl.close(); return; }

            const tokens = line.match(moveEx) || [];
            if (tokens.length !== 2) {
                console.log(`Invalid input`);
                rl.prompt();
                return;
            }

            move = new Move(sqFromString(tokens[0]), sqFromString(tokens[1]));
            let valid = false;
            for (let i = 0; i < moves.length; i++) {
                if (JSON.stringify(move) === JSON.stringify(moves[i])) {
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
            resolve(move);
        });
    });
}

function sqFromString(sq: string) {
    return GetSquare(GetFileFromChar(sq[0]), GetRankFromChar(sq[1]));
}