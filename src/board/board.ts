import { BOARD_SQ_NUM, NUM_CASTLE_COMBINATIONS, MAX_DEPTH, MAX_NUM_PER_PIECE, MAX_POSITION_MOVES, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Color, Piece, Rank, Square } from "../shared/enums";
import { IBoard, IBoardMeta } from "./board-types";
import { CastlePerm, GenerateHash32, IsPawn, PawnDir, PieceVal, RanksBoard } from "./board-utils";


export class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public meta: IBoardMeta;
    public history = [];
    public moveList: [][];
    public moveScores: [][];

    constructor(meta: IBoardMeta) {
        this.pieces = new Array(BOARD_SQ_NUM);
        this.pieceSquares = new Array(NUM_PIECE_TYPES);
        this.pieceQuantities = new Array(NUM_PIECE_TYPES);
        this.meta = meta;

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

    movePiece(from: Square, to: Square): void {
        const fromPiece = this.getPiece(from);
        const toPiece = this.getPiece(to);
        this.meta.update(from, to, fromPiece, toPiece);
        this.removePiece(fromPiece, from);
        this.addPiece(fromPiece, to);
    }
    isSquareAttacked(sq: Square, side: Color): boolean {
        throw new Error("Method not implemented.");
    }
    generatePosKey(): void {
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
    public material: number[];

    private pieceKeys: number[][];
    private castleKeys: number[];
    private sideKey: number;

    constructor() {
        this.material = [0, 0];

        this.castleKeys = new Array(NUM_CASTLE_COMBINATIONS);
        this.pieceKeys = new Array(NUM_PIECE_TYPES).fill(new Array(BOARD_SQ_NUM));
        this.sideKey = GenerateHash32(0);

        for (let piece = 0; piece < NUM_PIECE_TYPES; piece++) {
            for (let sq = 0; sq < BOARD_SQ_NUM; sq++) {
                this.pieceKeys[piece][sq] = GenerateHash32(piece * sq);
            }
        }
        for (let i = 0; i < NUM_CASTLE_COMBINATIONS; i++) {
            this.castleKeys[i] = GenerateHash32(i);
        }
    }

    resetCastling(): void {
        this.castlePermissions = CastleBit.none;
    }

    update(from: Square, to: Square, pieceFrom: Piece, pieceTo: Piece): void {
        if (IsPawn[pieceFrom] && RanksBoard[from] === Rank.one ) {
            this.enPas = from + PawnDir[this.sideToMove];
        }

        if ((this.castlePermissions & CastleBit.all) !== 0) {
            this.castlePermissions &= CastlePerm[from];
            this.castlePermissions &= CastlePerm[to];
        }

        this.HashPiece(pieceTo, to);
        this.HashPiece(pieceFrom, from);
        this.HashPiece(pieceFrom, to);
        this.HashCastle();
        this.HashEnPas();
        this.HashSide();

        this.sideToMove = this.sideToMove === Color.white ? Color.black : Color.white;
        this.material[this.sideToMove] -= PieceVal[pieceTo];
    }

    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    
    private HashPiece(piece: Piece, sq: number) { this.posKey ^= this.pieceKeys[piece][sq]; }
    private HashCastle() { this.posKey ^= this.castleKeys[this.castlePermissions]; }
    private HashSide() { this.posKey ^= this.sideKey; }
    private HashEnPas() { this.posKey ^= this.pieceKeys[Piece.none][this.enPas]; }
}