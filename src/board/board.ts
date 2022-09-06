import { BOARD_SQ_NUM, CASTLE_LEFT, CASTLE_RIGHT, INNER_BOARD_SQ_NUM, MAX_NUM_PER_PIECE, NUM_CASTLE_COMBINATIONS, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Color, Piece, Square } from "../shared/enums";
import { CastleLeftRook, CastlePerm, CastleRightRook, EnPasRank, GenerateHash32, GetRank, GetSq120, IsKing, IsPawn, LeftRook, PawnDir, PieceColor, PieceVal, RightRook, Rooks, StartingRank } from "./board-utils";
import { IBoard } from "./board-types";

export default class Board implements IBoard {
    //public meta: IBoardMeta;

    public sideToMove = Color.none;
    public ply = 0;
    public enPas = Square.none;
    public castlePermissions = CastleBit.none;
    public fiftyMoveCounter = 0;
    public posKey = 0;
    public material: number[];

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

    private static pieceKeys: number[][];
    private static castleKeys: number[];
    private static sideKey: number;

    /**
     * @todo squares outside of the inner board probably don't need hashes (could be set to zero)
     */
    constructor() {
        this.pieces = new Array(BOARD_SQ_NUM).fill(Piece.none);
        this.pieceSquares = new Array(NUM_PIECE_TYPES);
        this.pieceQuantities = new Array(NUM_PIECE_TYPES);
        //this = meta;

        const emptySqArray = new Array(MAX_NUM_PER_PIECE).fill(Square.none);
        for (let i = 0; i < NUM_PIECE_TYPES; i++) {
            this.pieceSquares[i] = [...emptySqArray];
        }
        this.pieceQuantities.fill(0);

        this.material = [0, 0];

        Board.castleKeys = new Array(NUM_CASTLE_COMBINATIONS);
        Board.pieceKeys = new Array(NUM_PIECE_TYPES).fill(new Array(BOARD_SQ_NUM));

        let seed = 0;
        Board.sideKey = GenerateHash32(seed++);
        for (let i = 0; i < NUM_CASTLE_COMBINATIONS; i++) {
            Board.castleKeys[i] = GenerateHash32(seed++);
        }
        //for (let i = 0; i < BOARD_SQ_NUM; i++) { Board.pieceKeys[Piece.none][i] = 0; }
        // ^ doing this breaks hash for en pas squareZZ
        for (let piece = Piece.none; piece < NUM_PIECE_TYPES; piece++) {
            for (let sq = 0; sq < BOARD_SQ_NUM; sq++) {
                Board.pieceKeys[piece][sq] = GenerateHash32(seed++);
            }
        }
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
        this.material[PieceColor[piece]] += PieceVal[piece];
        this.hashPiece(piece, sq);
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
            this.material[PieceColor[piece]] -= PieceVal[piece];
            this.fiftyMoveCounter = 0;
            this.hashPiece(piece, sq);
        }
    }
    getPiece(sq: Square): Piece {
        return this.pieces[sq];
    }
    * getPieces(side: Color = Color.none): IterableIterator<Piece> {
        for (let i = 0; i < INNER_BOARD_SQ_NUM; i++) {
            if (side === Color.none || PieceColor[this.pieces[GetSq120[i]]] === side)
                yield this.pieces[GetSq120[i]];
        }
    }
    * getSquares(piece: Piece): IterableIterator<Square> {
        for (let i = 0; i < MAX_NUM_PER_PIECE; i++) {
            if (this.pieceSquares[piece][i] === Square.none) break;
            yield this.pieceSquares[piece][i];
        }
    }

    movePiece(from: Square, to: Square): void {
        const piece = this.getPiece(from);

        if (IsPawn[piece]) {
            if (to === this.enPas) {
                this.removePiece(to + PawnDir[this.sideToMove]);
            }
            else if (GetRank[from] === StartingRank[this.sideToMove]
                && GetRank[to] === EnPasRank[this.sideToMove]) {
                this.enPas = from + PawnDir[this.sideToMove];
                this.hashEnPas();
            }
            else {
                this.hashEnPas();
                this.enPas = Square.none;
            }
            this.fiftyMoveCounter = 0;
        }
        else {
            if (IsKing[piece]) {
                if (from - to === CASTLE_LEFT) {
                    this.removePiece(LeftRook[this.sideToMove]);
                    this.addPiece(Rooks[this.sideToMove], CastleLeftRook[this.sideToMove]);
                }
                else if (from - to === CASTLE_RIGHT) {
                    this.removePiece(RightRook[this.sideToMove]);
                    this.addPiece(Rooks[this.sideToMove], CastleRightRook[this.sideToMove]);
                }
            }
            this.fiftyMoveCounter++;
        }

        if ((this.castlePermissions & CastleBit.all) !== 0) {
            this.castlePermissions &= CastlePerm[from];
            this.castlePermissions &= CastlePerm[to];
            this.hashCastle();
        }
        this.sideToMove = this.sideToMove === Color.white ? Color.black : Color.white;
        this.hashSide();
        
        this.removePiece(from);
        this.removePiece(to);
        this.addPiece(piece, to);
        this.ply++;
    }

    updatePositionKey(): void {
        if (this.sideToMove === Color.white) this.hashSide();
        if (this.enPas !== Square.none) this.hashEnPas();
        this.hashCastle();
    }

    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    
    public hashPiece(piece: Piece, sq: number) { this.posKey ^= Board.pieceKeys[piece][sq]; }
    public hashCastle() { this.posKey ^= Board.castleKeys[this.castlePermissions]; }
    public hashSide() { this.posKey ^= Board.sideKey; }
    public hashEnPas() { this.posKey ^= Board.pieceKeys[Piece.none][this.enPas]; }
}