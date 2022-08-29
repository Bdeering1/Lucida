import { Color, GameResult, Square } from "../shared/enums";
import { EnPasRank, GetRank, NonSlidingPieces, PawnCaptureDir, Pawns, PieceColor, PieceDir, SlidingPieces } from "./board-utils";
import { MAX_DEPTH, MAX_POSITION_MOVES } from "../shared/constants";
import { IBoard } from "./board-types";

export class Move {
    public from: Square;
    public to: Square;

    public constructor(from: Square, to: Square) {
        this.from = from;
        this.to = to;
    }
}

export default class MoveManager {
    private board: IBoard;

    /**
     * Lists of possible moves indexed by game ply
     */
    public moveList: Move[][];
    /**
     * Lists of scores for each move indexed by game plys
     */
    public moveScores: Move[][];
    /**
     * Result of the game
     * @todo this might belong in another class - there could be a game class which can be written to by the board or move classes
     */
    public gameResult = GameResult.none;

    constructor(board: IBoard) {
        this.board = board;

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_DEPTH);
        this.moveScores = new Array(MAX_DEPTH);
        for (let i = 0; i < MAX_DEPTH; i++) {
            this.moveList[i] = [...emptyMoveArray];
            this.moveScores[i] = [...emptyMoveArray];
        }
    }

    /**
     * Generate all possible moves for the current position
     */
    public generateMoves(): void {
        let moveIndex = 0;
        const ply = this.board.meta.ply;
        const side = this.board.meta.sideToMove;
        const opposingSide = side === Color.white ? Color.black : Color.white;
        if (side === Color.none) {
            return;
        }
        else if (side === Color.white) {
            // white castle moves
        }
        else {
            // black castle moves
        }

        // pawn moves
        const pawnType = Pawns[side];
        for (const sq of this.board.getSquares(pawnType)) {
            this.moveList[this.board.meta.ply][moveIndex++] = new Move(sq, sq + PieceDir[pawnType][side]);
            if (GetRank[sq] === EnPasRank[side]) {
                this.moveList[ply][moveIndex++] = new Move(sq, sq + PieceDir[pawnType][side] * 2);
            }
            for (const captureDir of PawnCaptureDir[side]) {
                const captureSq = sq + captureDir;
                if (PieceColor[this.board.getPiece(captureSq)] === opposingSide) {
                    this.moveList[ply][moveIndex++] = new Move(sq, captureSq);
                }
            }
        }

        // non sliding pieces
        NonSlidingPieces[side].forEach(piece => {
            for (const sq in this.board.getSquares(piece)) {
                // generate moves
            }
        });

        // sliding pieces
        SlidingPieces[side].forEach(piece => {
            for (const sq in this.board.getSquares(piece)) {
                // generate moves
            }
        });

        console.log(moveIndex);
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
        throw new Error("Method not implemented.");
    }
}