import { MAX_DEPTH, MAX_POSITION_MOVES } from "../shared/constants";

export default class MoveGenerator {
    /**
     * Lists of possible moves indexed by game ply
     * @todo this likely belongs in another class
     */
    public moveList: [][];
    /**
     * Lists of scores for each move indexed by game plys
     * @todo this likely belongs in another class
     */
    public moveScores: [][];

    constructor() {
        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_DEPTH).fill(emptyMoveArray);
        this.moveScores = new Array(MAX_DEPTH).fill(emptyMoveArray);
    }
}