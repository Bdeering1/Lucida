import { BOARD_SQ_NUM, MAX_DEPTH, MAX_NUM_PER_PIECE, MAX_POSITION_MOVES, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Color, Piece, Square } from "../shared/enums";
import { IBoard, IBoardMeta } from "./board-types";
import BoardUtils from "./board-utils";


export class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public meta: IBoardMeta;
    public history = [];
    public moveList: [][];
    public moveScores: [][];

    private utils: BoardUtils;

    constructor(meta: IBoardMeta, utils: BoardUtils) {
        this.pieces = new Array(BOARD_SQ_NUM);
        this.pieceSquares = new Array(NUM_PIECE_TYPES);
        this.pieceQuantities = new Array(NUM_PIECE_TYPES);
        this.meta = meta;
        this.utils = utils;

        const emptySqArray = new Array(MAX_NUM_PER_PIECE).fill(Square.none);
        this.pieceSquares.fill(emptySqArray);
        this.pieceQuantities.fill(0);

        const emptyMoveArray = new Array(MAX_POSITION_MOVES);
        this.moveList = new Array(MAX_DEPTH).fill(emptyMoveArray);
        this.moveScores = new Array(MAX_DEPTH).fill(emptyMoveArray);
    }

    addPiece(piece: Piece, sq: Square): void {
        this.pieces[sq] = piece;
        this.pieceSquares[piece].push(sq);
        this.pieceQuantities[piece]++;
    }
    removePiece(piece: Piece, sq: Square): void {
        this.pieces[sq] = Piece.none;
        this.pieceQuantities[piece]--;
        for (let idx = 0; idx < this.pieceSquares.length; idx++) {
            if (this.pieceSquares[piece][idx] === sq)
                this.pieceSquares[piece][idx] = Square.none;
        }
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

    makeMove(to: Square, from: Square): void {
        throw new Error("Method not implemented.");
    }

    isSquareAttacked(sq: Square, side: Color): boolean {
        throw new Error("Method not implemented.");
    }
}


export class BoardMeta implements IBoardMeta {
    public sideToMove = Color.none;
    public ply = 0;
    public enPas = Square.none;
    public castlePermissions = CastleBit.none;
    public fiftyMoveCounter = 0;
    public posKey = 0;
    public material = [];

    private utils: BoardUtils;

    constructor(utils: BoardUtils) {
        this.utils = utils;
    }

    resetCastling(): void {
        this.castlePermissions = CastleBit.none;
    }

    update(from: Square, to: Square, pieceFrom: Piece, pieceTo: Piece): void {
        if (this.utils.IsPawn[pieceFrom]) {
            this.enPas = from + this.utils.PawnDir[this.sideToMove];
        }

        if ((this.castlePermissions & CastleBit.all) !== 0) {
            this.castlePermissions &= this.utils.CastlePerm[from];
            this.castlePermissions &= this.utils.CastlePerm[to];
        }

        this.HashPiece(pieceTo, to);
        this.HashPiece(pieceFrom, from);
        this.HashPiece(pieceFrom, to);
        this.HashCastle();
        this.HashEnPas();
        this.HashSide();
    }

    generatePosKey() {
        throw new Error("Method not implemented.");
    }

    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    
    private HashPiece(piece: Piece, sq: number) { this.posKey ^= this.utils.PieceKeys[(piece * BOARD_SQ_NUM) + sq]; }
    private HashCastle() { this.posKey ^= this.utils.CastleKeys[this.castlePermissions]; }
    private HashSide() { this.posKey ^= this.utils.SideKey; }
    private HashEnPas() { this.posKey ^= this.utils.PieceKeys[this.enPas]; }
}