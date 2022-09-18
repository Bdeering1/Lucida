import { IBoard } from "../board/board-types";
import { getColorString } from "../cli/printing";
import { Color } from "../shared/enums";
import { GetOtherSide } from "../shared/utils";

export class GameStatus {
    complete: boolean = false;
    desc: string;
    winner: Color;
    constructor(complete: boolean, desc = "", winner = Color.none) {
        this.complete = complete;
        this.desc = desc;
        this.winner = winner;
    }
}

export function getGameStatus(board: IBoard, moves: number): GameStatus {
    if (moves === 0) return new GameStatus(true, "Stalemate");
    if (moves === -1) {
        const desc = `Checkmate, ${getColorString(GetOtherSide[board.sideToMove])} wins`;
        return new GameStatus(true, desc, GetOtherSide[board.sideToMove]);
    }

    return new GameStatus(false);
}
