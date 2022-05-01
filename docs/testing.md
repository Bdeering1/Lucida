## Testing

### Existing Test Cases
1. **Definitions**
- `def_success` is true
2. **Initialization**
- `InitFilesRanksBrd()`
  - `RanksBoard[]` - A8 has a value of RANKS.RANK_8 on the ranks board
  - `FilesBoard[]` - H1 has a value of FILES.FILE_H on the files board
- `InitHashKeys()`
  - ensures the last element of the `PieceKey` array has been populated (should mean every element was populated)
- `InitSq120ToSq64()`
  - `Sq120ToSq64[]` - A8 has a value of 0
  - `Sq64ToSq120[]` - the element at index 63 is H1
- `InitBoardVars()`
  - _test currently missing_
3. **FEN Parsing**
- `ParseFen()`
  - start position - the black king is on E8, `CheckBoard()` returns true
  - "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -" - there are no castle permissions, `CheckBoard()` returns true
  - correctly parses "6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1" - there is an enpassent square on D3, `CheckBoard()` returns true

`CheckBoard()`
  - for each piece in GameBoard.pList:
    - `GameBoard.pList[]` - for each element (loops through all piece types and uses GameBoard.numPieces) the piece in the corresponding position on the board is of the same type
    - `GameBoard.numPieces[]` - for each element (piece type) there are the same number of each piece type on the board
    - `GameBoard.material[]` - the material count for each side is equal to the actual material count on the board
    - `GameBoard.side` - value is either `COLOURS.WHITE` or `COLOURS.BLACK`
    - `GameBoard.posKey` - same as the value returned from `GeneratePosKey()`
4. **Board Intelligence**
- `SqAttacked()` - checks one arbitrary square and logs a board representation showing squares attacked
  - starting position test
  - position "r3k2r/8/8/3N4/8/8/8/R3K2R w KQkq - 0 1"
  - position "4k3/8/8/3q4/8/8/2B5/4K3 w - - 0 1"
5. **Move Generation**
- `GenerateMoves()`
  - starting position
    - checks that 20 moves are generated
  - position "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -"
    - checks that 7 moves are generated
  - position "4k3/1q6/8/8/8/8/8/4K3 b - - 0 1"
    - checks that 28 moves are generated
6. **Making Moves**
- `MakeMove()`
  - ...
- `UndoMove()`
  - ...


### Test Improvements
1. **Definitions**
2. **Initialization**
3. **FEN Parsing**
`CheckBoard()`
This is one of the better (more comprehensive) tests but it has one flaw: the `GameBoard.pList` test is reliant on the `GameBoard.numPieces[]` test being accurate and passing.
4. **Board Intelligence**
5. **Move Generation**
6. **Making Moves**