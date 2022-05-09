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
  - starting position - the black king is on E8, `CheckBoard()` returns true
  - "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -" - there are no castle permissions, `CheckBoard()` returns true
  - "6k1/8/8/8/3Pp3/8/8/6K1 b - d3 0 1" - there is an enpassent square on D3, `CheckBoard()` returns true

`CheckBoard()`
  - `GameBoard.pList[]` - for each element (loops through all piece types and uses GameBoard.numPieces) the piece in the corresponding position on the board is of the same type
  - `GameBoard.numPieces[]` - for each element (piece type) there are the same number of each piece type on the board
  - `GameBoard.material[]` - the material count for each side is equal to the actual material count on the board
  - `GameBoard.side` - value is either `COLOURS.WHITE` or `COLOURS.BLACK`
  - `GameBoard.posKey` - same as the value returned from `GeneratePosKey()`
4. **Board Intelligence**
- `SqAttacked()`
  - starting position - A1 is not attacked by white
  - "r3k2r/8/8/3N4/8/8/8/R3K2R w KQkq - 0 1" - C7 is attacked by white
  - "4k3/8/8/3q4/8/8/2B5/4K3 w - - 0 1" - H1 is attacked by black
5. **Move Generation**
- `GenerateMoves()`
  - starting position - checks that 20 moves are generated
  - "8/7p/5k2/5p2/p1p2P2/Pr1pPK2/1P1R3P/8 b - -" - checks that 7 moves are generated
  - "4k3/1q6/8/8/8/8/8/4K3 b - - 0 1" - checks that 28 moves are generated
6. **Making Moves**
- starting position
  - calls `MakeMove()` for the first generated move and checks the following using `MakeUndoMoveTest()`:
    - ply = 1
    - castleperm = 15
    - enPas = SQUARES.NO_SQ
    - moveListStart = 20
    - nextMoveListStart = 40
  - calls `UndoMove()` and checks the following using `MakeUndoMoveTest()`:
    - ply = 0
    - castleperm = 15
    - enPas = SQUARES.NO_SQ
    - moveListStart = 0
    - nextMoveListStart = 20
- starting position (repetition test)
  - for a certain large number of repetitions performs the following
    - selects a random move of the first four moves
    - calls `MakeMove()` then `CheckBoard()`
    - calls `UndoMove()` then `CheckBoard()`
    - calls `MakeMove()` then `CheckBoard()` again
  - checks that the loop ran for the expected number of iterations

`MakeUndoMoveTest()`
- `Checkboard()` test passes
- checks that the following variables have the expected values
  - `GameBoard.ply`
  - `GameBoard.castlePerm`
  - `GameBoard.enPas`
  - `GameBoard.movelistStart[GameBoard.ply]` (where the move list starts for the current ply)
  - `GameBoard.moveListStart[GameBoard.ply + 1]` (where the move list starts for the next ply)


### Test Improvements
1. **Definitions**
- `def_success`
  - this test is probably unnecessary
2. **Initialization**
- `InitFilesRanksBrd()`
  - this test should check every square on the file/rank boards, or at least one square from each file/rank
- `InitHashKeys()`
  - should check every element of the `PieceKey` array or at least the first _and_ last elements
  - should check `SideKey`
  - should check `CastleKeys[]`
3. **FEN Parsing**
- `ParseFen()`
  - any special test cases should not be testable using `CheckBoard`
    - currently the starting position has a redundant test case that is also tested in `CheckBoard()`
  - there should be clear reasoning behind each FEN used to test this function
- `CheckBoard()`
  - this is one of the better (more comprehensive) tests but it has one flaw: the `GameBoard.pList` test is reliant on the `GameBoard.numPieces[]` test being accurate and passing.
4. **Board Intelligence**
- `SqAttacked()`
  - there should be clearly thought out reasoning behind each FEN tested, it may only be necessary to have one FEN
  - each FEN should be more thoroughly tested
    - ensure offboard squares can't be attacked for each piece type
    - ensure knights attack the correct sqares
    - ensure horizontally sliding pieces can't attack through blocking pieces
    - ensure diagonally sliding pieces can't attack through blocking pieces
    - ensure pawns on the promotion rank won't attack offboard?
  - other board intelligence tests?
5. **Move Generation**
- `GenerateMoves()`
  - ensure moves generated match a list of expected values for at least one position
  - there should be some specific testing for the following
    - en passent moves
    - promotion moves
    - pawn moves from starting squares
    - castling moves
    - captures for each piece type
    - sliding pieces can't move past blocking pieces
    - no offboard moves are generated
6. **Making Moves**
- `MakeUndoMoveTest()`
  - the naming of this test isn't super accurate - all it does it check GameBoard values against expected values
  - this test should check the GameBoard history to ensure it is correct
- each test case should probably call both `MakeUndoMoveTest()` and `CheckBoard()` (or these methods could be combined somhow?)
- the random move making seems fundamentally flawed, if there are less that 4 moves available in a given position the test will fail (and possible cause a runtime error)
- there should maybe be tests for `AddPiece()`, `ClearPiece()`, and `MovePiece()`