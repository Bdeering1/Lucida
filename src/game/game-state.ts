import { Color, MoveStatus } from "../shared/enums";
import { GetOtherSide } from "../shared/utils";
import { IBoard } from "../board/iboard";
import { INSUFFICENT_MATERIAL } from "../shared/constants";
import { getColorString } from "../cli/printing";

export class GameStatus {
    complete = false;
    desc: string;
    winner: Color;
    constructor(complete: boolean, desc = "", winner = Color.none) {
        this.complete = complete;
        this.desc = desc;
        this.winner = winner;
    }
}

export function getGameStatus(board: IBoard, moves: number): GameStatus {
    if (moves === MoveStatus.stalemate) return new GameStatus(true, "Stalemate");
    if (moves === MoveStatus.checkmate) {
        const desc = `Checkmate, ${getColorString(GetOtherSide[board.sideToMove])} wins`;
        return new GameStatus(true, desc, GetOtherSide[board.sideToMove]);
    }
    // eslint-disable-next-line no-magic-numbers
    if (board.fiftyMoveCounter >= 50) return new GameStatus(true, "Stalemate, fifty moves");
    
    if (board.repeats.get(board.posKey) === 2) return new GameStatus(true, "Draw by repetition");

    if (board.hasPawns) return new GameStatus(false);
    if (board.material[Color.white] <= INSUFFICENT_MATERIAL && board.material[Color.black] <= INSUFFICENT_MATERIAL) {
        return new GameStatus(true, "Draw, insufficient material"); 
    }

    return new GameStatus(false);
}