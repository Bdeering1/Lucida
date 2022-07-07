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
    none,
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h
}
export enum Rank {
    none,
    one,
    two,
    three,
    four,
    five,
    six,
    seven,
    eight
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
    a1 = 21, b1 = 22, c1 = 23, d1 = 24, e1 = 25, f1 = 26, g1 = 27, h1 = 28,
    a2 = 31, b2 = 32, c2 = 33, d2 = 34, e2 = 35, f2 = 36, g2 = 37, h2 = 38,
    a3 = 41, b3 = 42, c3 = 43, d3 = 44, e3 = 45, f3 = 46, g3 = 47, h3 = 48,
    a4 = 51, b4 = 52, c4 = 53, d4 = 54, e4 = 55, f4 = 56, g4 = 57, h4 = 58,
    a5 = 61, b5 = 62, c5 = 63, d5 = 64, e5 = 65, f5 = 66, g5 = 67, h5 = 68,
    a6 = 71, b6 = 72, c6 = 73, d6 = 74, e6 = 75, f6 = 76, g6 = 77, h6 = 78,
    a7 = 81, b7 = 82, c7 = 83, d7 = 84, e7 = 85, f7 = 86, g7 = 87, h7 = 88,
    a8 = 91, b8 = 92, c8 = 93, d8 = 94, e8 = 95, f8 = 96, g8 = 97, h8 = 98,
    offBoard = 99, none = 100
}