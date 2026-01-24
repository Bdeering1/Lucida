/* eslint-disable no-use-before-define */
import { IBoard } from "../board/iboard";
import Move from "../game/move";
import { Square } from "../shared/enums";

export default class TranspositionTable {
    private table: Map<number, SearchResult>;

    constructor() {
        this.table = new Map();
    }

    public get size(): number {
        return this.table.size;
    }

    public has(posKey: number): boolean {
        return this.table.has(posKey);
    }

    public get(posKey: number): SearchResult | undefined {
        return this.table.get(posKey);
    }

    public set(posKey: number, value: SearchResult): void {
        this.table.set(posKey, value);
    }

    public trim(ply: number): void {
        for (const [key, value] of this.table) {
            if (value.ply < ply - 1) this.table.delete(key);
        }
    }

    public clear(): void {
        this.table.clear();
    }
    
    public getPV(board: IBoard, maxDepth: number): Move[] {
        const pv: Move[] = [];
        let posKey = board.posKey;
        let depth = 0;
        while (depth++ < maxDepth && this.table.has(posKey)) {
            const move = this.table.get(posKey)!.move;
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
}

export class SearchResult {
    private _score: number;
    private _depth: number;
    private _ply: number;
    private _candidate: boolean;
    private _move: Move;

    constructor(score: number, depth: number, ply: number) {
        this._score = score;
        this._depth = depth;
        this._ply = ply;
        this._candidate = false;
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
    public get candidate(): boolean {
        return this._candidate;
    }
    public set candidate(candidate: boolean) {
        this._candidate = candidate;
    }
    public get move(): Move {
        return this._move;
    }
    public set move(move: Move) {
        this._move = move;
    }
}