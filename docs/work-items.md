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
- implement npm or pnpm

### Technical Debt
- typing
  - implement Typescript (enums will be particularily helpful)
- other
  - reproducable position key hashing (remove randomness)
  - flip board back around, and just change how it is printed to get white on the bottom
  - add unit tests to build pipeline
  - implement eslint

### Future Ideas
- backend
  - focus on creating a robust engine CLI
  - containerize application and interface through API (REST?)
  - there should be an object representing the engine configuration/settings, this could also be represented as JSON 
- front end
  - find chess board module / library for front end
  - implement a lightweight front end framework (eg. Svelte)
  - possibly integrate css framework / component library
  - create desktop/native app? (electron, flutter, etc.)