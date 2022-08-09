import { BOARD_SQ_NUM, CASTLE_LEFT, CASTLE_RIGHT, INNER_BOARD_SQ_NUM, MAX_NUM_PER_PIECE, NUM_CASTLE_COMBINATIONS, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Color, Piece, Rank, Square } from "../shared/enums";
import { CastlePerm, EnPasRank, GenerateHash32, GetRank, GetSq120, IsKing, IsPawn, PawnDir, PieceColor, PieceVal, Rooks } from "./board-utils";
import { IBoard, IBoardMeta } from "./board-types";


export class Board implements IBoard {
    /**
     * @private
     * Stores the piece on each square of the board
     */
    private pieces: Piece[];
    /**
     * @private
     * Stores the square each piece is on indexed by piece type
     */
    private pieceSquares: Square[][];
    /**
     * @private
     * Number of each type of piece on the board
     */
    private pieceQuantities: number[];

    public meta: IBoardMeta;

    constructor(meta: IBoardMeta) {
        this.pieces = new Array(BOARD_SQ_NUM).fill(Piece.none);
        this.pieceSquares = new Array(NUM_PIECE_TYPES);
        this.pieceQuantities = new Array(NUM_PIECE_TYPES);
        this.meta = meta;

        const emptySqArray = new Array(MAX_NUM_PER_PIECE).fill(Square.none);
        this.pieceSquares.fill([...emptySqArray]);
        this.pieceQuantities.fill(0);
    }

    addPiece(piece: Piece, sq: Square): void {
        this.pieces[sq] = piece;
        for (let i = 0; i < MAX_NUM_PER_PIECE; i++) {
            if (this.pieceSquares[piece][i] === Square.none) {
                this.pieceSquares[piece][i] = sq;
                break;
            }
        }
        this.pieceQuantities[piece]++;
        this.meta.material[PieceColor[piece]] -= PieceVal[piece];
        this.meta.HashPiece(piece, sq);
    }
    removePiece(sq: Square): void {
        const piece = this.pieces[sq];
        this.pieces[sq] = Piece.none;
        if (piece !== Piece.none) {
            this.pieceQuantities[piece]--;
            for (let i = 0; i < MAX_NUM_PER_PIECE; i++) {
                if (this.pieceSquares[piece][i] === sq) {
                    this.pieceSquares[piece][i] = Square.none;
                    break;
                }
            }
            this.meta.material[PieceColor[piece]] -= PieceVal[piece];
            this.meta.fiftyMoveCounter = 0;
            this.meta.HashPiece(piece, sq);
        }
    }
    getPiece(sq: Square): Piece {
        return this.pieces[sq];
    }
    * getPieces(): IterableIterator<Piece> {
        for (let i = 0; i < INNER_BOARD_SQ_NUM; i++) {
            yield this.pieces[GetSq120[i]];
        }
    }
    * getSquares(piece: Piece): IterableIterator<Square> {
        console.log(this.pieceSquares);
        for (let i = 0; i < MAX_NUM_PER_PIECE; i++) {
            if (this.pieceSquares[piece][i] === Square.none) break;
            yield this.pieceSquares[piece][i];
        }
    }

    movePiece(from: Square, to: Square): void {
        const piece = this.getPiece(from);
        if (IsPawn[piece] && to === this.meta.enPas) {
            this.removePiece(to + PawnDir[this.meta.sideToMove]);
        }
        else if (IsKing[piece]) {
            if (from - to === CASTLE_LEFT) {
                this.removePiece(to - 2);
                this.addPiece(Rooks[this.meta.sideToMove], to + 1);
            }
            else if (from - to === CASTLE_RIGHT) {
                this.removePiece(to + 1);
                this.addPiece(Rooks[this.meta.sideToMove], to - 1);
            }
        }
        
        this.meta.update(from, to, piece);
        this.removePiece(from);
        this.removePiece(to);
        this.addPiece(piece, to);
    }

    updatePositionKey(): void {
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

    private static pieceKeys: number[][];
    private static castleKeys: number[];
    private static sideKey: number;

    /**
     * @todo squares outside of the inner board probably don't need hashes (could be set to zero)
     */
    constructor() {
        this.material = [0, 0];

        BoardMeta.castleKeys = new Array(NUM_CASTLE_COMBINATIONS);
        BoardMeta.pieceKeys = new Array(NUM_PIECE_TYPES).fill(new Array(BOARD_SQ_NUM));

        let seed = 0;
        BoardMeta.sideKey = GenerateHash32(seed++);
        for (let i = 0; i < NUM_CASTLE_COMBINATIONS; i++) {
            BoardMeta.castleKeys[i] = GenerateHash32(seed++);
        }
        for (let i = 0; i < BOARD_SQ_NUM; i++) { BoardMeta.pieceKeys[Piece.none][i] = 0; }
        for (let piece = Piece.whitePawn; piece < NUM_PIECE_TYPES; piece++) {
            for (let sq = 0; sq < BOARD_SQ_NUM; sq++) {
                BoardMeta.pieceKeys[piece][sq] = GenerateHash32(seed++);
            }
        }
    }

    copyThis(): IBoardMeta {
        return { ...this, material: [...this.material] };
    }

    resetCastling(): void {
        this.castlePermissions = CastleBit.none;
    }

    update(from: Square, to: Square, piece: Piece): void {
        if (this.enPas !== Square.none) {
            this.HashEnPas();
            this.enPas = Square.none;
        }
        if (IsPawn[piece]) {
            if (GetRank[from] === EnPasRank[this.sideToMove]
                && GetRank[to] === Rank.four || Rank.five) {
                this.enPas = from + PawnDir[this.sideToMove];
                this.HashEnPas();
            }
            this.fiftyMoveCounter = 0;
        }
        else {
            this.fiftyMoveCounter++;
        }

        if ((this.castlePermissions & CastleBit.all) !== 0) {
            this.castlePermissions &= CastlePerm[from];
            this.castlePermissions &= CastlePerm[to];
            this.HashCastle();
        }

        this.sideToMove = this.sideToMove === Color.white ? Color.black : Color.white;
        this.HashSide();

        this.ply++;
    }

    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    
    public HashPiece(piece: Piece, sq: number) { this.posKey ^= BoardMeta.pieceKeys[piece][sq]; }
    public HashCastle() { this.posKey ^= BoardMeta.castleKeys[this.castlePermissions]; }
    public HashSide() { this.posKey ^= BoardMeta.sideKey; }
    public HashEnPas() { this.posKey ^= BoardMeta.pieceKeys[Piece.none][this.enPas]; }
}