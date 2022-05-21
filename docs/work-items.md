## Work Items

### Next Steps
- test refactoring
  - implement new tests according to testing plan

### Technical Debt
- functions that need review
  - ResetBoard - should probably reset board history
  - InitBoardVars - might need a better name, could be combined with ResetBoard
  - GenerateMoves - "doesn't check if moves are illegal yet"
- defs that need review
  - FR2SQ - mainly used for looping through the board, might not be necessary
  - LoopSlideIndex / LoopNonSlideIndex - these should maybe be renamed (they act as maps: side -> list of pieces)
- other
  - reproducable position key hashing (remove randomness)
  - flip board back around, and just change how it is printed to get white on the bottom
  - add unit tests to build pipeline
  - implement eslint
  - there's a whole bunch of nomenclature that should be reviewed

### Future Ideas
- backend
  - make use of events?
  - take advantage of node's global object?
  - multi-threading
  - take advantage of C++ packages for intensive tasks
  - containerize application and interface through API (REST?)
  - there should be an object representing the engine configuration/settings, this could also be represented as JSON 
- front end
  - find chess board module / library for front end
  - implement a lightweight front end framework (eg. Svelte)
  - possibly integrate css framework / component library
  - create desktop/native app? (electron, flutter, etc.)