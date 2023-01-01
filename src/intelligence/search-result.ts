export default class SearchResult {
    private _score: number;
    private _depth: number;

    constructor(score: number, depth: number) {
        this._score = score;
        this._depth = depth;
    }

    public get score(): number {
        return this._score;
    }
    public get depth(): number {
        return this._depth;
    }
}