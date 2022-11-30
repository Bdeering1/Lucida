import { GetOtherSide, Pawns } from "../shared/utils";
import { Color } from "../shared/enums";
import { IBoard } from "../board/board-types";
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
    if (moves === 0) return new GameStatus(true, "Stalemate");
    if (moves === -1) {
        const desc = `Checkmate, ${getColorString(GetOtherSide[board.sideToMove])} wins`;
        return new GameStatus(true, desc, GetOtherSide[board.sideToMove]);
    }
    if (board.fiftyMoveCounter >= 50) return new GameStatus(true, "Stalemate, fifty moves");
    
    for (const key of board.repeats) {
        if (board.posKey === key) return new GameStatus(true, "Draw by repetition");
    }

    if (hasPawn(board, Color.white) || hasPawn(board, Color.black)) return new GameStatus(false);
    if (board.material[Color.white] <= 50325 && board.material[Color.black] <= 50325) {
        return new GameStatus(true, "Draw, insufficient material");
    }

    return new GameStatus(false);
}

function hasPawn(board: IBoard, side: Color): boolean {
    for (const piece of board.getPieces(side)) {
        if (piece === Pawns[side]) return true;
    }
    return false;
}