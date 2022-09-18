export class GameStatus {
    complete: boolean = false;
    desc: string;
    constructor(complete: boolean, desc = "") {
        this.complete = complete;
        this.desc = desc;
    }
}

export function getGameStatus(): GameStatus {
    return new GameStatus(false);
}