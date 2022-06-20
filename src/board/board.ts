import { BOARD_SQ_NUM, MAX_NUM_PER_PIECE, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Colour, Piece, Square } from "../shared/enums";
import { IBoard, IBoardMeta } from "./board-types";


export class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public meta: IBoardMeta;
    public history : IBoardMeta[];
    public moveList: [][];
    public moveScores: [][];

    constructor(meta: IBoardMeta) {
        this.pieces = new Array(BOARD_SQ_NUM);
        this.pieceSquares = new Array(NUM_PIECE_TYPES).fill(new Array(MAX_NUM_PER_PIECE));
        this.pieceQuantities = new Array(NUM_PIECE_TYPES).fill(0);
        this.meta = meta;
    }

    addPiece(piece: Piece, sq: Square): void {
        this.pieces[sq] = piece;
        this.pieceSquares[piece].push(sq);
        this.pieceQuantities[piece]++;
    }
    getPiece(sq: Square): Piece {
        return this.pieces[sq];
    }
    * getPieces(): IterableIterator<Piece> {
        for (let i = 0; i < BOARD_SQ_NUM; i++) {
            yield this.pieces[i];
        }
    }
    * getSquares(piece: Piece): IterableIterator<Square> {
        for (let i = 0; i < BOARD_SQ_NUM; i++) {
            yield this.pieceSquares[piece][i];
        }
    }

    updateMeta(from: Square, to: Square): void {
        throw new Error("Method not implemented.");
    }

    public isSquareAttacked(sq: Square, side: Colour): boolean {
        throw new Error("Method not implemented.");
    }
}


export class BoardMeta implements IBoardMeta {
    public sideToMove: Colour.both;
    public ply = 0;
    public enPas = Square.none;
    public castlePermissions = CastleBit.none;
    public fiftyMoveCounter = 0;
    public posKey: number;
    public material: number[];

    constructor() {
        this.castlePermissions = CastleBit.none;
    }

    resetCastling(): void {
        this.castlePermissions = CastleBit.none;
    }

    public get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    public get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    public get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    public get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    public setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    public setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    public setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    public setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
}