# OnSet Data Visualization Implementation
**Kevin Jin and Kwuang Tang, CS3891, Introduction to Visualization, Vanderbilt University**

Technique project - from whitepaper https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=6876026&tag=1

## How to Run:
Local: Use an http server to serve the `/src` dir. Then browse to the server host and port as usual (perhaps something like `localhost:8000`) which will serve `index.html`. NOTE: opening up `index.html` directly in most browsers won't work because of CORS errors (opening in Firefox usually works though)


Deployed: Alternatively, just go to https://d3viz.netlify.com/ (if it doesn't load the first time and there are no console errors, try refreshing page)

## Process Book
See [here](./process-book/process.md).

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


- the LAB to RGB color space conversion was necessary because CSS does not natively support using LAB colors. We generated colors in LAB and mapped them to RGB when displaying using the following lab2rgb function derived from [antimatter15's github](https://github.com/antimatter15/rgb-lab). The math behind the color conversion was non-trivial which is why we did not just implement it ourselves.
```js
function lab2rgb(lab){ // non-trivial conversion code taken from https://github.com/antimatter15/rgb-lab
    var y = (lab[0] + 16) / 116,
        x = lab[1] / 500 + y,
        z = y - lab[2] / 200,
        r, g, b;
  
    x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
    y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
    z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);
  
    r = x *  3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y *  1.8758 + z *  0.0415;
    b = x *  0.0557 + y * -0.2040 + z *  1.0570;
  
    r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
    g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
    b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;
  
    return `rgb(${(Math.max(0, Math.min(1, r)) * 255).toFixedDown(2)}, ${(Math.max(0, Math.min(1, g)) * 255).toFixedDown(2)}, ${(Math.max(0, Math.min(1, b)) * 255).toFixedDown(2)})`;   
  }
```
## Other Credits

The .txt to .csv conversion of our example dataset was done by [browserling](https://www.browserling.com/tools/text-to-csv)

Our example dataset of animal attributes came from https://dtai.cs.kuleuven.be/CP4IM/datasets/
