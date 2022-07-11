import { BOARD_SQ_NUM, MAX_DEPTH, MAX_NUM_PER_PIECE, MAX_POSITION_MOVES, NUM_CASTLE_COMBINATIONS, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Color, Piece, Square } from "../shared/enums";
import { CastlePerm, EnPasRank, GenerateHash32, GetRank, IsPawn, PawnDir, PieceColor, PieceVal } from "./board-utils";
import { IBoard, IBoardMeta } from "./board-types";


export class Board implements IBoard {
    public pieces: Piece[];
    public pieceSquares: Square[][];
    public pieceQuantities: number[];

    public meta: IBoardMeta;
    public history = [];
    public moveList: [][];
    public moveScores: [][];

    constructor(meta: IBoardMeta) {
        this.pieces = new Array(BOARD_SQ_NUM).fill(Piece.none);
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
        this.meta.HashPiece(piece, sq);
        this.meta.material[PieceColor[piece]] -= PieceVal[piece];
    }
    removePiece(sq: Square): void {
        this.pieces[sq] = Piece.none;
        const piece = this.pieces[sq];
        if (piece !== Piece.none) {
            this.pieceQuantities[piece]--;
            for (let idx = 0; idx < this.pieceSquares.length; idx++) {
                if (this.pieceSquares[piece][idx] === sq)
                    this.pieceSquares[piece][idx] = Square.none;
            }
            this.meta.HashPiece(piece, sq);
            this.meta.material[PieceColor[piece]] -= PieceVal[piece];
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
        for (let i = 0; i < MAX_NUM_PER_PIECE; i++) {
            yield this.pieceSquares[piece][i];
        }
    }

    movePiece(from: Square, to: Square): void {
        const piece = this.getPiece(from);
        this.meta.update(from, to, piece);
        this.removePiece(from);
        this.addPiece(piece, to);
    }
    isSquareAttacked(sq: Square, side: Color): boolean {
        throw new Error("Method not implemented.");
    }
    generatePosKey(): void {
        for (let piece = 1; piece < NUM_PIECE_TYPES; piece++) {
            for (const sq of this.getSquares(piece)) {
                this.meta.HashPiece(piece, sq);
            }
        }
        if (this.meta.sideToMove === Color.white) this.meta.HashSide();
        if (this.meta.enPas !== Square.none) this.meta.HashEnPas();
        this.meta.HashCastle();
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

    update(from: Square, to: Square, piece: Piece): void {
        this.enPas = Square.none;
        if (IsPawn[piece] && GetRank[from] === EnPasRank[this.sideToMove] ) {
            this.enPas = from + PawnDir[this.sideToMove];
            this.HashEnPas();
        }

        if ((this.castlePermissions & CastleBit.all) !== 0) {
            this.castlePermissions &= CastlePerm[from];
            this.castlePermissions &= CastlePerm[to];
            this.HashCastle();
        }

        this.HashSide();

        this.sideToMove = this.sideToMove === Color.white ? Color.black : Color.white;
    }

    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    
    public HashPiece(piece: Piece, sq: number) { this.posKey ^= this.pieceKeys[piece][sq]; }
    public HashCastle() { this.posKey ^= this.castleKeys[this.castlePermissions]; }
    public HashSide() { this.posKey ^= this.sideKey; }
    public HashEnPas() { this.posKey ^= this.pieceKeys[Piece.none][this.enPas]; }
}