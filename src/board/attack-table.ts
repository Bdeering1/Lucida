import { Color, Square } from "../shared/enums";
import { GetSq64 } from "../shared/utils";
import { IBoard } from "./iboard";
import { INNER_BOARD_SQ_NUM } from "../shared/constants";

export interface IAttackTable {
    getAttacks(color: Color, sq: Square): number;
    init(): void;
    updateFrom(sq: Square): void;
    updateTo(sq: Square): void;
}

export default class AttackTable {
    private board: IBoard;

    private whiteAttacks: number[];
    private blackAttacks: number[];

    constructor(board: IBoard) {
        this.board = board;
        this.whiteAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
        this.blackAttacks = new Array(INNER_BOARD_SQ_NUM).fill(0);
    }

    public getAttacks(color: Color, sq: Square): number {
        return (color === Color.white ? this.whiteAttacks : this.blackAttacks)[GetSq64[sq]];
    }

    public init(): void {

    }

    public updateFrom(sq: Square): void {
        
    }

    public updateTo(sq: Square): void {
        
    }
}