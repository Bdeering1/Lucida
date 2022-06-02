/* eslint-disable no-magic-numbers, no-shadow */

export enum Piece {
    empty,
    whitePawn,
    whiteKnight,
    whiteBishop,
    whiteRook,
    whiteQueen,
    whiteKing,
    blackPawn,
    blackKnight,
    blackBishop,
    blackRook,
    blackQueen,
    blackKing
}
  
export enum File {
    a, b, c, d, e, f, g, h, none
}
export enum Rank {
    one, two, three, four, five, six, seven, eight, none
}
  
export enum Colour {
    white,
    black,
    both
}
  
export enum CastleBit {
    whiteKing = 1,
    whiteQueen = 2,
    blackKing = 4,
    blackQueen = 8,
    all = 15
}

/**
 * Represents a square on the 120 sized board
 * 
 * valid board squares: [21,98], no square: 99, off board: 100
 */
export enum Square {
    a1 = 91, b1 = 92, c1 = 93, d1 = 94, e1 = 95, f1 = 96, g1 = 97, h1 = 98,
    a8 = 21, b8 = 22, c8 = 23, d8 = 24, e8 = 25, f8 = 26, g8 = 27, h8 = 28,
    none = 99, offBoard = 100
}