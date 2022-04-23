General Notes


SqAttacked
-could potentially be done faster / more neatly
-didn't end up using PiecePawn, PieceKnight, or PieceKing from defs


FR2Q Issue
-ranks were originally stored upside down in RanksBoard (going top to bottom), so GameBoard.pieces stored white first (on top), then black
-when printing rank 8 was printed first so it always dispolayed nicely (white on bottom)
-this was changed for consistency, white is now stored on the bottom in GameBoard.pieces


Streamlining once finished series
-go through defs.js and remove anything that isn't used
-go through all comments and ensure they are necessary and accurate
-go through console logs and remove unnecessary logs / ensure clarity
-change PrMove to allow for algebraic notation rather than coordinate notation
-sort defs.js into multiple more coherent files
-add NOCASTLE bool to improve speed of MakeMove()?
-replace pList with something else? or don't use



Changes from Original

-changed all the pList associated values from 14 to 13 (12 piece types + empty type)
-changed FilesBrd to FilesBoard
-changed PCEINDEX to PIECEINDEX
-board stored in GameBoard.pieces is flipped FR2SQ, SQUARES, etc changed
-...


Questions


Issues

***there is currently a bug in undo move which is causing PrintAllMoves not to work correctly for a couple of the knight moves