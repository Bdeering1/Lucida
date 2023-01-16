export default class SearchResult {
    private _score: number;
    private _depth: number;
    private _ply: number;

    constructor(score: number, depth: number, ply: number) {
        this._score = score;
        this._depth = depth;
        this._ply = ply;
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
}

export function trimTranspositions(table: Map<number, SearchResult>, ply: number): void {
    for (const [key, value] of table) {
        if (value.ply < ply) table.delete(key);
    }
}