import { Color, GameResult, Square } from "../shared/enums";
import { MAX_DEPTH, MAX_POSITION_MOVES } from "../shared/constants";
import { IBoard } from "./board-types";

/**
 * @todo better name for this class? BoardMoves? MoveManager? GameManager?
 */
export default class MoveGenerator {
    private board: IBoard;

    /**
     * Lists of possible moves indexed by game ply
     */
    public moveList: [][];
    /**
     * Lists of scores for each move indexed by game plys
     */
    public moveScores: [][];
    /**
     * Result of the game
     * @todo this might belong in another class - there could be a game class which can be written to by the board or move classes
     */
    public gameResult = GameResult.none;

    constructor(board: IBoard) {
        this.board = board;

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_DEPTH).fill(emptyMoveArray);
        this.moveScores = new Array(MAX_DEPTH).fill(emptyMoveArray);
    }

    /**
     * Generate all possible moves for the current position
     */
    public generateMoves(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Given a square on the inner board and a side, returns whether or not that square is attacked
     */
    public isSquareAttacked(sq: Square, side: Color): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Determine if the game has ended, and if so, what the result was
     */
    private CheckGameEnded() {

    }
}