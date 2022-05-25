## Work Items

### Next Steps
- implement ES Lint
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
  - JS Doc
  - Javascript events
  - multi-threading
  - C++ packages for intensive tasks
  - docker container
  - engine configuration object, could also be represented as JSON 
- front end
  - chess board library / library for front end
  - lightweight front end framework (eg. Svelte)
  - integrate css framework / component library
  - create desktop/native app? (electron, flutter, etc.)