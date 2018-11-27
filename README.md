# OnSet Data Visualization Implementation
**Kevin Jin and Kwuang Tang, CS3891, Introduction to Visualization, Vanderbilt University**

Technique project - from whitepaper https://www.cc.gatech.edu/~stasko/papers/infovis14-onset.pdf

## How to Run:
Local: Use an http server to serve the `/src` dir. Then browse to the server host and port as usual (perhaps something like `localhost:8000`) which will serve `index.html`. NOTE: opening up `index.html` directly in most browsers won't work because of CORS errors (opening in Firefox usually works though)


Deployed: Alternatively, just go to https://d3viz.netlify.com/ (if it doesn't load the first time and there are no console errors, try refreshing page)

## Features (Obvious and Non-Obvious)

The features in our application include the following:
- PixelLayers displayed as 2D matrices from input data
- Highlighting a pixel in one layer highlights the same one in other PixelLayers as well
- Drag and dropping PixelLayers onto each other calls AND/OR operational joins on the dataset of each PixelLayer
- Ability to easily switch between AND/OR joins
- OR joins have pixel luminacity determined by pixel frequency in the joined data.
- Each PixelLayer has a label that is updated as operational joins are performed on it and also text wrapping is supported
- Ability to add new PixelLayers to the visualization by importing new attribute data into the existing visualization
- Colors are unique for every PixelLayer.
- Chrome and Firefox support for our application

All code for these features are written by us with the exception of code listed below in the External Code section.

## External Code
### Libraries
- The text wrapping implementation for the PixelLayer labels are modified from the [d3-textwrap NPM module](https://www.npmjs.com/package/d3-textwrap) to work for our 'backend-less' d3 visualization. The library was also updated by us to support d3 v5 (originally supported d3 v4). Additional modifications were made by us to the library to suit our project better. The library is contained in `src/d3-textwrap-master`
The library is used in this line of our program:
```js
// https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric keep only alphanumeric characters
// https://github.com/vijithassar/d3-textwrap modified the node package to support client side javascript and for this project's purposes
let wrap = textwrap(`${bottomLayer.label.replace(/[^a-z0-9]/gi,'')}-text`).bounds({height: 480, width: 100});
```
### Code Snippets
There were several pieces of code that we wrote that were inspired by code snippets from stackoverflow and other websites

- The regex on this line of our code to remove all non-alphanumeric characters was from [stackoverflow](https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric)
```js
// https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric keep only alphanumeric characters
// https://github.com/vijithassar/d3-textwrap modified the node package to support client side javascript and for this project's purposes
let wrap = textwrap(`${bottomLayer.label.replace(/[^a-z0-9]/gi,'')}-text`).bounds({height: 480, width: 100});
```

- the mouse position code that is supported for multiple browsers (Firefox and Chrome included) was taken from [plainjs](https://plainjs.com/javascript/events/getting-the-current-mouse-position-16/) because d3's mouse position implementation was found to be buggy.
```js
function mousePos(e) { //mouse position code inspired by https://plainjs.com/javascript/events/getting-the-current-mouse-position-16/
    e = e || window.event;

    var pageX = e.pageX;
    var pageY = e.pageY;

    // IE 8
    if (pageX === undefined) {
        pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return [pageX,pageY-heightOffset]
}
```
## Other Credits

The .txt to .csv conversion of our example dataset was done by [browserling](https://www.browserling.com/tools/text-to-csv)

Our example dataset of animal attributes came from https://dtai.cs.kuleuven.be/CP4IM/datasets/
