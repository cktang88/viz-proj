## process-book

NOTE: this is a WIP, and will most likely be heavily modified as the final deadline approaches.

### Update 1

- got basic data cleaning
  - convert boolean values to 0/1
  - complex aggregation of data to convert nested array of number/strings into objects
  - each object has a collection of values
  - currently only using `animals` data
- display pixel layers

### Proposal

- different colors for each pixel layers
- drag and drop handlers (wip)
- mouse hover highlighting (wip)
- added new data structure to handle layers to accomodate interaction
  - is an array of objects, each obj has a d3 selection representing a pixel layer, as well as a label (name, initially attribute), x/y location, and lastJoinType
  - two join types, in enum: AND, OR
- did a lot of re-architecting, refactoring, rewrote data structures, as we figured out how to represent data and display it better
  - data representations got more complex in order to accomodate all the extra features we were adding
- tough parts: finding out how to correspond the dom element with the d3 selection with the actual data it represents (used ids for comparison mostly)
