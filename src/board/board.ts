import { BOARD_SQ_NUM, CASTLE_LEFT, CASTLE_RIGHT, INNER_BOARD_SQ_NUM, MAX_GAME_MOVES, MAX_NUM_PER_PIECE, NUM_CASTLE_COMBINATIONS, NUM_PIECE_TYPES, PIECE_CHAR } from "../shared/constants";
import { CastleBit, Color, Piece, Square } from "../shared/enums";
import { CastleLeftRook, CastlePerm, CastleRightRook, EnPasRank, GetOtherSide, GetRank, GetSq120, IsKing, IsPawn, LeftRook, PawnDir, PieceColor, PieceVal, RightRook, Rooks, StartingRank, generateHash32 } from "../shared/utils";
import { IBoard } from "./board-types";

export default class Board implements IBoard {

    public sideToMove = Color.none;
    public ply = 0;
    public enPas = Square.none;
    public fiftyMoveCounter = 0;
    public material: number[];
    public posKey = 0;
    public repeats: number[] = [];

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
    /**
     * @private
     * Bitwise representation of the current castle permissions
     */
    private castlePermissions = CastleBit.none;
    /**
     * Stores the state of the board after each move, enables undo operation
     */
    // eslint-disable-next-line no-use-before-define
    private history: Board[];

    private static pieceKeys: number[][];
    private static castleKeys: number[];
    private static sideKey: number;

    constructor() {
        this.material = [0, 0];

        this.pieces = new Array(BOARD_SQ_NUM).fill(Piece.none);
        this.pieceSquares = new Array(NUM_PIECE_TYPES);
        this.pieceQuantities = new Array(NUM_PIECE_TYPES);

        const emptySqArray = new Array(MAX_NUM_PER_PIECE).fill(Square.none);
        for (let i = 0; i < NUM_PIECE_TYPES; i++) {
            this.pieceSquares[i] = [...emptySqArray];
        }
        this.pieceQuantities.fill(0);

        this.history = new Array(MAX_GAME_MOVES);

        Board.castleKeys = new Array(NUM_CASTLE_COMBINATIONS);
        Board.pieceKeys = new Array(NUM_PIECE_TYPES).fill(new Array(BOARD_SQ_NUM));

        let seed = 0;
        Board.sideKey = generateHash32(seed++);
        for (let i = 0; i < NUM_CASTLE_COMBINATIONS; i++) {
            Board.castleKeys[i] = generateHash32(seed++);
        }
        for (let piece = Piece.none; piece < NUM_PIECE_TYPES; piece++) {
            for (let sq = 0; sq < BOARD_SQ_NUM; sq++) {
                Board.pieceKeys[piece][sq] = generateHash32(seed++);
            }
        }
    }

    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    public hasCastleMoves(): boolean {
        return this.castlePermissions !== CastleBit.none;
    }

    public addPiece(piece: Piece, sq: Square): void {
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
    public removePiece(sq: Square): void {
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
            this.hashPiece(piece, sq);
        }
    }
    public movePiece(from: Square, to: Square, promote: Piece = Piece.none): void {
        this.appendToHistory();
        this.checkRepeats();

        let enPas = Square.none;
        if (this.enPas !== Square.none) {
            enPas = this.enPas;
            this.hashEnPas();
            this.enPas = Square.none;
        }

        let piece = this.getPiece(from);
        if (IsPawn[piece]) {
            if (to === enPas) {
                this.removePiece(to + PawnDir[GetOtherSide[this.sideToMove]]);
            }
            else if (GetRank[from] === StartingRank[this.sideToMove]
                && GetRank[to] === EnPasRank[this.sideToMove]) {
                this.enPas = from + PawnDir[this.sideToMove];
                this.hashEnPas();
            }
            else if (promote !== Piece.none) {
                piece = promote;
            }
            this.fiftyMoveCounter = 0;
        }
        else {
            if (IsKing[piece]) {
                if (to - from === CASTLE_LEFT) {
                    this.removePiece(LeftRook[this.sideToMove]);
                    this.addPiece(Rooks[this.sideToMove], CastleLeftRook[this.sideToMove]);
                }
                else if (to - from === CASTLE_RIGHT) {
                    this.removePiece(RightRook[this.sideToMove]);
                    this.addPiece(Rooks[this.sideToMove], CastleRightRook[this.sideToMove]);
                }
            }
            if (this.getPiece(to) !== Piece.none) {
                this.fiftyMoveCounter = 0;
            }
            else {
                this.fiftyMoveCounter++;
            }
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

    public hasPawns(): boolean {
        return this.pieceQuantities[Piece.whitePawn] !== 0 || this.pieceQuantities[Piece.blackPawn] !== 0;
    }
    public getPiece(sq: Square): Piece {
        return this.pieces[sq];
    }
    public * getPieces(side: Color = Color.none): IterableIterator<Piece> {
        for (let i = 0; i < INNER_BOARD_SQ_NUM; i++) {
            if (side === Color.none || PieceColor[this.pieces[GetSq120[i]]] === side)
                yield this.pieces[GetSq120[i]];
        }
    }
    public * getSquares(piece: Piece): IterableIterator<Square> {
        for (let i = 0; i < this.pieceQuantities[piece]; i++) {
            if (this.pieceSquares[piece][i] === Square.none) continue;
            yield this.pieceSquares[piece][i];
        }
    }

    public updatePositionKey(): void {
        if (this.sideToMove === Color.white) this.hashSide();
        if (this.enPas !== Square.none) this.hashEnPas();
        this.hashCastle();
    }

    public undoMove(): void {
        this.restore(this.ply - 1);
    }
    public appendToHistory(): void {
        this.history[this.ply] = this.copy();
    }

    public restore(ply: number): void {
        if (ply < 0 || ply >= this.ply) return;
        const prev = this.history[ply];
        this.sideToMove = prev.sideToMove;
        this.ply = prev.ply;
        this.enPas = prev.enPas;
        this.castlePermissions = prev.castlePermissions;
        this.fiftyMoveCounter = prev.fiftyMoveCounter;
        this.material = prev.material;
        this.posKey = prev.posKey;
        this.repeats = prev.repeats;

        this.pieces = prev.pieces;
        this.pieceSquares = prev.pieceSquares;
        this.pieceQuantities = prev.pieceQuantities;
    }

    public copy(deep = false): Board {
        const copy = deep ? Object.create(this) : {} as Board; // deep copy retains methods
        copy.sideToMove = this.sideToMove;
        copy.ply = this.ply;
        copy.enPas = this.enPas;
        copy.castlePermissions = this.castlePermissions;
        copy.fiftyMoveCounter = this.fiftyMoveCounter;
        copy.material = [...this.material];
        copy.posKey = this.posKey;
        copy.repeats = [...this.repeats];

        copy.pieces = [...this.pieces];
        copy.pieceSquares = new Array(NUM_PIECE_TYPES);
        for (let i = 0; i < NUM_PIECE_TYPES; i++) {
            copy.pieceSquares[i] = [...this.pieceSquares[i]];
        }
        copy.pieceQuantities = [...this.pieceQuantities];
        
        return copy;
    }

    private checkRepeats(): void {
        if (this.fiftyMoveCounter === 0) return;
        let idx = 0;
        while (this.history[idx] !== undefined && idx < this.ply) {
            if (this.history[idx].posKey === this.posKey) this.repeats.push(this.posKey);
            idx++;
        }
    }

    private hashPiece(piece: Piece, sq: number) { this.posKey ^= Board.pieceKeys[piece][sq]; }
    private hashCastle() { this.posKey ^= Board.castleKeys[this.castlePermissions]; }
    private hashSide() { this.posKey ^= Board.sideKey; }
    private hashEnPas() { this.posKey ^= Board.pieceKeys[Piece.none][this.enPas]; }
}