## process-book

NOTE: this is a WIP, and will most likely be heavily modified as the final deadline approaches.




Timeline
---

### Update 1

- got basic data cleaning
  - convert boolean values to 0/1
  - complex aggregation of data to convert nested array of number/strings into objects
  - each object has a collection of values
  - currently only using `animals` data
- display pixel layers

### Prototype

- different colors for each pixel layers
- drag and drop handlers
- mouse hover highlighting
- added new data structure to handle layers to accomodate interaction
  - is an array of objects, each obj has a d3 selection representing a pixel layer, as well as a label (name, initially attribute), x/y location, and lastJoinType
  - two join types, in enum: AND, OR
- did a lot of re-architecting, refactoring, rewrote data structures, as we figured out how to represent data and display it better
  - data representations got more complex in order to accomodate all the extra features we were adding
- tough parts: finding out how to correspond the dom element with the d3 selection with the actual data it represents (used ids for comparison mostly)
- text wrapping for labels of pixellayers (wip)
- supporting multiple browsers (FireFox and Chrome work, IE and Edge are not reliable)

### Update 2

- used HSL colors instead of RGB for pixel layers
    - each new pixel layer is a random Hue
- implemented different shades of color for OR operations, like in the whitepaper
    - using uniform Luminosity scaling, for coloring best practices
- implemented text wrapping in the labels for combined pixel layers
    - via help from external npm lib (used Node.js + `package.json`), but on build creates a static JS file that is linked in main `index.html`
- add ability to input new pixel layers to data
    - b/c we don't have a backend server, we can't do file upload, so we'll use an input box
