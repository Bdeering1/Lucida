## Testing

### Existing Test Cases
1. **Definitions**
- header file code runs without errors
2. **Initialization**
- InitFilesRanksBrd()
  - check that the board is oriented correctly
- InitHashKeysTest()
  - ...
- InitSq120ToSq64()
  - ...
3. **FEN Parsing**
- ParseFen()
  - correctly parses start position
  - correctly parses "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -"
  - correctly parses "6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1"
4. **Board Intelligence**
- SqAttacked() - checks one arbitrary square and logs a board representation showing squares attacked
  - starting position test
  - position "r3k2r/8/8/3N4/8/8/8/R3K2R w KQkq - 0 1"
  - position "4k3/8/8/3q4/8/8/2B5/4K3 w - - 0 1"
5. **Move Generation**
- GenerateMoves()
  - starting position
    - checks that 20 moves are generated
  - position "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -"
    - checks that 7 moves are generated
  - position "4k3/1q6/8/8/8/8/8/4K3 b - - 0 1"
    - checks that 28 moves are generated
6. **Making Moves**
- MakeMove()
  - ...
- UndoMove()
  - ...
