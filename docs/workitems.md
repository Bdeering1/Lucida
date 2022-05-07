## Work Items

### Next Steps
- test documentation
  - add more detail to existing test case documentation
    - fill in unfinished details, add description of FEN positions etc. (done for sections 1-3)
  - make a testing plan which includes missing test cases and revisions
- test refactoring
  - make necessary changes to unit tests according to testing plan
  - consider implementing a testing framework (eg. Jest)
  - figure out what to do about the isPass variable for now
- move project to node
  - add all necessary imports / exports using ESM
  - look into pnpm

### Technical Debt
- markup and module structure
  - combine debug.html and index.html into one file
  - implement a better module system
- front end
  - better separation of UI and business logic
  - maybe integrate css framework / component library
- typing
  - implement Typescript (enums will be particularily helpful)
- other
  - reproducable position key hashing (remove randomness)
  - flip board back around, and just change how it is printed to get white on the bottom
  - add unit tests to build pipeline
  - implement eslint

### Future Ideas
- interfacing with the engine
  - remove necessity of a browser by moving to nodeJS or deno
    - focus on creating a robust engine CLI
  - containerize application and interface through API (REST?)
  - there should be an object representing the engine configuration/settings, this could also be represented as JSON 
- find chess board module / library for front end
- replace Jquery with something lighter weight (eg. Svelte)
- create desktop/native app? (electron, flutter, )