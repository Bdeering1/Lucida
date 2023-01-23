import { IBoard } from "../board/iboard";
import Move from "../game/move";
import { Square } from "../shared/enums";

export default class SearchResult {
    private _score: number;
    private _depth: number;
    private _ply: number;
    private _move: Move;

    constructor(score: number, depth: number, ply: number) {
        this._score = score;
        this._depth = depth;
        this._ply = ply;
        this._move = new Move(Square.none, Square.none);
    }

    public get score(): number {
        return this._score;
    }
    public get depth(): number {
        return this._depth;
    }
    public get ply(): number {
        return this._ply;
    }
    public get move(): Move {
        return this._move;
    }
    public set move(move: Move) {
        this._move = move;
    }
}

export function trimTranspositions(table: Map<number, SearchResult>, ply: number): void {
    for (const [key, value] of table) {
        if (value.ply < ply - 1) table.delete(key);
    }
}

export function getPV(table: Map<number, SearchResult>, board: IBoard, maxDepth: number): Move[] {
    const pv: Move[] = [];
    let posKey = board.posKey;
    let depth = 0;
    while (depth++ < maxDepth && table.has(posKey)) {
        const move = table.get(posKey)!.move;
        if (move.equals(new Move(Square.none, Square.none))) break;
        pv.push(move);
        board.makeMove(move);
        posKey = board.posKey;
    }
    const pvCopy: Move[] = [...pv];
    while (pvCopy.length > 0) {
        const move = pvCopy.pop()!;
        board.undoMove(move);
    }
    return pv;
}