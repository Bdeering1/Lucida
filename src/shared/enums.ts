/* eslint-disable no-magic-numbers, no-shadow */
export const enum Piece {
    none,
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
  
export const enum File {
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    none
}
export enum Rank {
    one,
    two,
    three,
    four,
    five,
    six,
    seven,
    eight,
    none
}
  
export const enum Color {
    white,
    black,
    none
}
  
export const enum CastleBit {
    none = 0,
    whiteKing = 1,
    whiteQueen = 2,
    blackKing = 4,
    blackQueen = 8,
    all = 15,
}

/**
 * Represents a square on the 120 sized board
 * 
 * valid board squares: [21,98], no square: 99, off board: 100
 */
export const enum Square {
    a1 = 91, b1 = 92, c1 = 93, d1 = 94, e1 = 95, f1 = 96, g1 = 97, h1 = 98,
    a2 = 81, b2 = 82, c2 = 83, d2 = 84, e2 = 85, f2 = 86, g2 = 87, h2 = 88,
    a3 = 71, b3 = 72, c3 = 73, d3 = 74, e3 = 75, f3 = 76, g3 = 77, h3 = 78,
    a4 = 61, b4 = 62, c4 = 63, d4 = 64, e4 = 65, f4 = 66, g4 = 67, h4 = 68,
    a5 = 51, b5 = 52, c5 = 53, d5 = 54, e5 = 55, f5 = 56, g5 = 57, h5 = 58,
    a6 = 41, b6 = 42, c6 = 43, d6 = 44, e6 = 45, f6 = 46, g6 = 47, h6 = 48,
    a7 = 31, b7 = 32, c7 = 33, d7 = 34, e7 = 35, f7 = 36, g7 = 37, h7 = 38,
    a8 = 21, b8 = 22, c8 = 23, d8 = 24, e8 = 25, f8 = 26, g8 = 27, h8 = 28,
    none = 99, offBoard = 100
}