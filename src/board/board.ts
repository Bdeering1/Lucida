import { BOARD_SQ_NUM, CASTLE_LEFT, CASTLE_RIGHT, INNER_BOARD_SQ_NUM, MAX_GAME_MOVES, MAX_NUM_PER_PIECE, NUM_CASTLE_COMBINATIONS, NUM_PIECE_TYPES } from "../shared/constants";
import { CastleBit, Color, Piece, Square } from "../shared/enums";
import { CastleLeftRook, CastlePerm, CastleRightRook, EnPasRank, GetOtherSide, GetRank, GetSq120, IsKing, IsPawn, LeftRook, PawnDir, PieceColor, PieceVal, RightRook, Rooks, StartingRank, generateHash32, Pawns } from "../shared/utils";
import { IBoard } from "./board-types";
import Move from "../game/move";

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
     * @description only the first pieceQuantities[piece] squares are valid for each piece
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

    get quantities(): number[] { return this.pieceQuantities; }
    get whiteKingCastle() { return (this.castlePermissions & CastleBit.whiteKing) !== 0; }
    get whiteQueenCastle() { return (this.castlePermissions & CastleBit.whiteQueen) !== 0; }
    get blackKingCastle() { return (this.castlePermissions & CastleBit.blackKing) !== 0; }
    get blackQueenCastle() { return (this.castlePermissions & CastleBit.blackQueen) !== 0; }
    setWhiteKingCastle(): void { this.castlePermissions |= CastleBit.whiteKing; }
    setWhiteQueenCastle(): void { this.castlePermissions |= CastleBit.whiteQueen; }
    setBlackKingCastle(): void { this.castlePermissions |= CastleBit.blackKing; }
    setBlackQueenCastle(): void { this.castlePermissions |= CastleBit.blackQueen; }
    public hasCastleMoves(): boolean { return this.castlePermissions !== CastleBit.none; }

    public addPiece(piece: Piece, sq: Square): void {
        this.pieces[sq] = piece;
        this.pieceSquares[piece][this.pieceQuantities[piece]] = sq;
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
                if (this.pieceSquares[piece][i] === sq) { // swap with last piece
                    this.pieceSquares[piece][i] = this.pieceSquares[piece][this.pieceQuantities[piece]];
                    break;
                }
            }
            this.material[PieceColor[piece]] -= PieceVal[piece];
            this.hashPiece(piece, sq);
        }
    }
    public makeMove(move: Move): void {
        const from = move.from;
        const to = move.to;
        const promotion = move.promotion;

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
            else if (promotion !== Piece.none) {
                piece = promotion;
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
    public undoMove(move: Move): void {
        this.sideToMove = this.sideToMove === Color.white ? Color.black : Color.white;
        const piece = move.promotion === Piece.none ? this.getPiece(move.to) : Pawns[PieceColor[move.promotion]];

        this.removePiece(move.to);
        this.addPiece(move.capture, move.to);
        this.addPiece(piece, move.from);
        this.ply--;

        this.fiftyMoveCounter = this.history[this.ply].fiftyMoveCounter;
        this.enPas = this.history[this.ply].enPas;
        this.castlePermissions = this.history[this.ply].castlePermissions;
        this.posKey = this.history[this.ply].posKey;
        this.repeats = this.history[this.ply].repeats;
        
        if (IsPawn[piece]) {
            if (move.to === this.enPas) {
                this.removePiece(move.to);
                this.addPiece(Pawns[GetOtherSide[this.sideToMove]], move.to + PawnDir[GetOtherSide[this.sideToMove]]);
            }
        }
        else if (IsKing[piece]) {
            if (move.to - move.from === CASTLE_LEFT) {
                this.removePiece(CastleLeftRook[this.sideToMove]);
                this.addPiece(Rooks[this.sideToMove], LeftRook[this.sideToMove]);
            }
            else if (move.to - move.from === CASTLE_RIGHT) {
                this.removePiece(CastleRightRook[this.sideToMove]);
                this.addPiece(Rooks[this.sideToMove], RightRook[this.sideToMove]);
            }
        }
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
        for (let i = this.pieceQuantities[piece] - 1; i >= 0; i--) {
            yield this.pieceSquares[piece][i];
        }
    }

    public appendToHistory(): void {
        this.history[this.ply] = {} as Board;
        this.history[this.ply].fiftyMoveCounter = this.fiftyMoveCounter;
        this.history[this.ply].enPas = this.enPas;
        this.history[this.ply].castlePermissions = this.castlePermissions;
        this.history[this.ply].posKey = this.posKey;
        this.history[this.ply].repeats = [...this.repeats];
    }

    public clone(deep = false): Board {
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
        for (let piece = 0; piece < NUM_PIECE_TYPES; piece++) {
            copy.pieceSquares[piece] = [...this.pieceSquares[piece]];
        }
        copy.pieceQuantities = [...this.pieceQuantities];
        
        return copy;
    }
    public restoreInstance(board: Board): void {
        this.sideToMove = board.sideToMove;
        this.ply = board.ply;
        this.enPas = board.enPas;
        this.castlePermissions = board.castlePermissions;
        this.fiftyMoveCounter = board.fiftyMoveCounter;
        this.material = board.material;
        this.posKey = board.posKey;
        this.repeats = board.repeats;

        this.pieces = board.pieces;
        this.pieceSquares = board.pieceSquares;
        this.pieceQuantities = board.pieceQuantities;
    }

    public updatePositionKey(): void {
        if (this.sideToMove === Color.white) this.hashSide();
        if (this.enPas !== Square.none) this.hashEnPas();
        this.hashCastle();
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