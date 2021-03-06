/*
data cleaning: split each .txt into header (category names) and body (data) segments
manually replace quotation marks, colons, equal signs, anything that isn't useful
note: .txt to .csv conversion done via https://www.browserling.com/tools/text-to-csv

NOTE: the data processing methods in loadData() are SPECIFIC to data derived from https://dtai.cs.kuleuven.be/CP4IM/datasets/
*/

/**
 * USER DEFINED PARAMETERS
 * width - width of a single PixelLayer
 * height - height of a single PixelLayer
 * baseColor - color to represent False pixel values
 * saturation - base saturation of each PixelLayer's True pixel value color
 * lum - base luminacity
 * lumDiff - difference in luminacity between pixels of differing frequency 1 in OR join operation
 */
const width = 100,
    height = width,
    margin = 2.5,
    textPad = 20,
    saturation = 94,
    lum = 75,
    lumDiff = 15

const header = {};
const elements = [];
const sets = {}; // dict of {attr: {attribute data obj}}
const heightOffset = 132; // distance between top of screen and svg div

this.offset = 0; // offset, used for plotting pixel layers
this.layers = []; // pixel layers
this.colors = new Set(); // all colors
this.labMap = {} // map from RGB to LAB colors so we can update luminance during OR operations
this.baseColor = "#3a3a3a"; // color of each false pixel

const JoinType = {
    AND: 'AND',
    OR: 'OR'
}

const getNewColor = () => { // LAB color space
    let a;
    let b;
    while(!a || !b || this.colors.has([a,b])) {
        a = Math.round(Math.random()*12)*((Math.random() > 0.5) ? -1 : 1)*10
        b = Math.round(Math.random()*12)*((Math.random() > 0.5) ? -1 : 1)*10
    }
    this.colors.add([a,b]);
    let rgbColor = lab2rgb([lum,a,b])
    this.labMap[rgbColor] = [lum, a, b]
    return rgbColor
}


// execute main method
try {
    loadData();
} catch (e) {
    console.log(e);
    alert('Error loading data due to CORS security issue, please run a web server.')
}

/**
 * Gets input
 */
function inputSubmitted() {
    let newheaders = document.getElementById('header_input').value.trim()
    let newbody = document.getElementById('body_input').value.trim()

    // small helper func to translate raw string data into nice obj format
    const parseRawData = (raw, numTokens) => {
        let result = []
        let validInput = true
        raw.split('\n')
            // clean lines
            .map(line => line.split(' ').filter(token => token.trim().length > 0))
            // convert each line to obj
            .forEach(tokens => {
                if (tokens.length === 0 || (numTokens && tokens.length !== numTokens))
                    validInput = false;
                result.push([...tokens])
            })
        return validInput ? result : false
    }

    // make input into nice format
    const HEADER_LENGTH = 3
    const BODY_LENGTH = 1
    newheaders = parseRawData(newheaders, HEADER_LENGTH)
    newbody = parseRawData(newbody, BODY_LENGTH)
    // console.log('new headers: ', newheaders)
    // console.log('new body: ', newbody)

    // some input validation
    if (!newheaders) {
        alert(`Invalid header. \nEach line must have ${HEADER_LENGTH} tokens.`)
        return;
    }
    let invalidHeader = false
    let NEW_ATTRIBUTE;
    
    newheaders.forEach(([key, attr, val]) => {
        // check no header keys exist already
        if (key in header) {
            alert(`Error: The key ${key} = "${header[key].attribute}". Cannot redeclare.`)
            invalidHeader = true
        }
        // check no header attributes exist already
        if (attr in sets){
            alert(`Error: The attribute ${attr} exists already. Cannot redeclare.`)
            invalidHeader = true
        }

        NEW_ATTRIBUTE = attr; // set newAttr
    })
    
    if (invalidHeader){
        return
    }
    // check all lines in body right length
    if (!newbody) {
        alert(`Invalid body. \nEach line must have ${BODY_LENGTH} tokens.`)
        return;
    }
    // check all lines in body contains attr in header
    let invalidBody = false
    const headerkeys = newheaders.map(e=>e[0])
    console.log(headerkeys)
    newbody.map(e=> e[0]).forEach(e => {
        console.log(e)
        if(!headerkeys.includes(e)) {
            alert(`${e} is an invalid element in body (must match a header entry).`)
            invalidBody = true
        }
    })
    if (invalidBody){
        return
    }

    // add new data + refresh
    addHeaderData(newheaders);
    addNewAttr(NEW_ATTRIBUTE, newbody);
    assignColors()
    // always puts new pixellayer on newline
    const xInit = margin;
    const yInit = Math.max(...layers.map(layer => layer.y)) + margin + textPad + height
    plotPixelLayer(NEW_ATTRIBUTE, layers.length, xInit, yInit)

    // normalizeToBinary()

    // if success, show confirm, clear input
    // document.getElementById('header_input').value = ''
    // document.getElementById('body_input').value = ''
}

// when inputing new body data
function addNewAttr(newAttr, newbody){
    // add the new attr to each element
    elements.forEach((e, i) => {
        if (newbody.length === 0)
            return
        let num = newbody.shift()[0]
        if (parseInt(num))
            num = parseInt(num)

        const value = header[num].value
        const newElem = e
        if (value === "true" || value === "false") {
            newElem[newAttr] = +(value === "true"); // convert from "true"/"false" to 0/1
        }
        else {
            // anything that isn't true/false will be normalized later
            newElem[newAttr] = value;
        }
        elements[i] = newElem
    })
    // console.log('elements: ', elements)
}

// main method, loads data
function loadData() {
    loadHeaders();
    loadBody();
}

function addHeaderData(header_data) {
    // console.log(header_data);
    header_data.forEach(e => {
        // console.log('header:', e)
        // add attributes to `headers` hashmap
        const [num, attr, val] = Object.keys(e);
        if (e[num] in header) {
            alert(`Error adding header data: The key ${num} = "${header[e[num]].attribute}". Cannot remap to "${e[attr]}".`)
        }
        else {
            header[e[num]] = {
                attribute: e[attr],
                value: e[val]
            };
        }
        // console.log(header)
    });
    
    // console.log('headers: ')
    // console.log(header)

    // create sets
    Object.keys(header).forEach(e => {
        const attr = header[e].attribute;
        if (attr in sets) // don't recompute repeated attrs
            return;
        sets[attr] = {
            data: []
        };
    });
    // console.log('sets: ')
    // console.log(sets)
}

function addBodyData(body_data) {
    // structure data elements properly
    body_data.forEach(e => {
        const obj = {};
        for (let key in e) {
            const {attribute, value} = header[e[key]]
            if (value === "true" || value === "false") {
                obj[attribute] = +(value === "true"); // convert from "true"/"false" to 0/1
            }
            else obj[attribute] = value;
            // anything that isn't true/false will be normalized later
        }
        elements.push(obj)
    })
}

function loadHeaders() {
    // load headers
    d3.csv('./data/zoo-header.csv')
        .then(addHeaderData)
        .catch(err => console.error(err))
}

function loadBody() {
    // load body elements
    d3.csv('./data/zoo-body.csv')
        .then(addBodyData)
        .then(normalizeToBinary) // This is specific to the animal dataset, convert # legs to true/false value
        .then(assignColors) // assign colors for each attr
        .then(plot_it) // plot
        .catch(err => console.error(err))
}

function assignColors() {
    // assign new colors only if doesn't already have a color
    Object.keys(sets)
        .filter(attr => !sets[attr].color)
        .forEach(attr => sets[attr].color = getNewColor())
}

// function to plot each pixelLayer
const plotPixelLayer = (attr, index, xInit, yInit) => {

    // number of rows and columns
    const rowcolNum = numberOfRowsCol(elements.length);
    // console.log(elements.length, rowcolNum);

    const layerScale = d3.scaleLinear().domain([0, rowcolNum]).rangeRound,
        xScale = layerScale([0, width]), // pixel width and X position
        yScale = layerScale([0, height]) // pixel height and Y position
    
    const DISPLAY_WIDTH = document.getElementById('leftpanel').clientWidth - width
    const blockSize = width + margin

    let y = 0
    let x = 0
    let topLayer;
    const pixelLayer = d3.select('.container').append('svg')
        .attr('width', width)
        .attr('height', height + textPad)
        .attr('id', attr) // set ID equal to attr
        .style("margin", `${margin}px`)
        .attr("x", ()=> {
            if (xInit) {
                x = xInit
                return x
            }
            const currOut = index*blockSize + 2*width
            y = Math.floor(currOut/DISPLAY_WIDTH)
            const actualX = (currOut%DISPLAY_WIDTH) - 2*width
            if (y !== Math.floor((currOut - blockSize)/DISPLAY_WIDTH)) {
                this.offset = -actualX
            }
            x = actualX + this.offset
            return x
        })
        .attr("y", ()=> {
            if (yInit) {
                y = yInit
                return y
            }
            y *= (blockSize+textPad)
            return y
        })
    
    
    // the label will be more complex for combined layers
    this.layers.push({
        x: x, 
        y: y, 
        label: attr, 
        pixelLayer: pixelLayer,
        data: elements.map((e) => e[attr] > 0 ? 1 : 0)
    })

    const main = pixelLayer.append('g')

    pixelLayer.append('text')
        .attr('id', `${attr}-text`)
        .attr('x', width / 2)
        .attr('y', 115)
        .attr('text-anchor', 'middle')
        .attr('font-size', '15px')
        .attr('font-weight', "bold")
        .text(attr)

    main.append("g").selectAll(`.pixel`).data(elements).enter().append("rect")
        .attr("y", (d, i) => yScale(Math.floor(i / rowcolNum)))
        .attr("x", (d, i) => xScale(i % rowcolNum))
        .attr("width", xScale(1))
        .attr("height", yScale(1))
        .attr("fill", d => d[attr] > 0 ? sets[attr].color : baseColor)
        .attr("class",(d, i) => `pixel i${i}`)
        .attr("pixelattr", attr)

        // mouse hover pixel anim
        .on('mouseover', function(d,i) {
            highlightPixel(i, true)
        })
        .on('mouseout', function(d,i) {
            highlightPixel(i, false)
        })

    pixelLayer.call(d3.drag()
    .on("start", function() {
        this.parentElement.appendChild(this); // bring to front
        topLayer = findPixelLayerByID(this.id)
    })
    .on("drag", function() {
        const mouse = window.event ? mousePos() : d3.mouse(this) // accounts for Firefox and Chrome
        d3.select(this)
            .attr("x", mouse[0] - width/2)
            .attr("y", mouse[1] - height/2)
            .style('opacity', .8); // follow mouse
    })
    .on("end", function() {
        d3.select(this).style('opacity', 1)
        const mouseLoc = window.event ? mousePos() : d3.mouse(this)
        const layerTwo = getPixelLayerAtLoc(mouseLoc);

        // update location AFTER getting second layer so that second layer is different
        const newloc = [mouseLoc[0] - width/2, mouseLoc[1] - height/2]
        updatePixelLayerLoc(topLayer, newloc)

        if (!layerTwo)
            return
        // if same label, disregard
        if (topLayer.label === layerTwo.label)
            return
        let jointype = document.getElementById("join-select").value

        combineLayer(topLayer, layerTwo, jointype == 'and' ? JoinType.AND : JoinType.OR)
        dehighlightAll()
    })
    );
}

let highlightPixel = (index, highlight) => {
    d3.select('.container').selectAll(`.pixel.i${index}`)
        .attr("stroke", d => highlight ? 'white' : 'none')
}

let dehighlightAll = () => {
    d3.select('.container').selectAll(`.pixel`)
        .attr("stroke", d => 'none')
}

// update the pixel colors in the layer by their corresponding data property
let updatePixelsInLayer = (layer, color) => {
    layer.pixelLayer.selectAll('g').selectAll('g').selectAll('.pixel').attr('fill',(d,i) => {
        if (layer.lastJoinType == JoinType.OR) {
            let labColors = this.labMap[color];
            if (!labColors) return color;
            color = lab2rgb([Math.max(lum-lumDiff*(layer.data[i]-1),20), labColors[1], labColors[2]]);
            this.labMap[color] = [Math.max(lum-lumDiff*(layer.data[i]-1),20), labColors[1], labColors[2]]
        }
        return layer.data[i] > 0 ? color : this.baseColor
    })
}

// Get the layer at the current x,y location
let getPixelLayerAtLoc = ([locX, locY]) => {
    return this.layers.find(({x,y}) => x < locX && x+width > locX && y < locY && y+height > locY)
}

// Update the locations of pixel layers in their layer's object
let updatePixelLayerLoc = (pixelLayer, [x,y]) => {
    const obj = this.layers.find(e => e.label == pixelLayer.label)
    obj.x = x
    obj.y = y
}

// Find pixel layers by their ID
let findPixelLayerByID = (layerID) => {
    return this.layers.find(obj => obj.label === layerID)
}

/**
 * plots all pixel layers
 */
function plot_it() {
    //hack to support firefox
    d3.select('.container')
        .append('svg').attr("x",0).attr("y",1000)
        .append("text").text("CS3891 Vanderbilt University")
    Object.keys(elements[0]).forEach((key, i) => plotPixelLayer(key,i))
}
/**
 * 
 * @param {String} topLayer First layer
 * @param {String} bottomLayer Second layer
 * @param {JoinType} joinType type of join (AND/OR)
 */
let combineLayer = (topLayer, bottomLayer, joinType) => {
    // when combining, remove both layers, add new layer
    const a = topLayer.label;
    const b = bottomLayer.label;
    if (joinType !== JoinType.AND && joinType !== JoinType.OR)
        console.error(`Undefined join type.`)
    
    let combineFunc;
    if (joinType === JoinType.OR) {
        combineFunc = (e,i) => e+topLayer.data[i]
    }
    // if AND: if either zero, new val = 0, else add values
    if (joinType === JoinType.AND) {
        combineFunc = (e,i) => e*topLayer.data[i] > 0 ? e+topLayer.data[i] : 0
    }
    // console.log('Layers joined with: ', joinType)
    bottomLayer.data = bottomLayer.data.map(combineFunc)

    bottomLayer.lastJoinType = joinType // record last join type of B, to display properly (gradient (OR) vs absolute values (AND))
    bottomLayer.label = `(${a} ${joinType} ${b})`, // new label based on two previous labels
    
    bottomLayer.pixelLayer.selectAll(".pixel").attr("pixelattr", bottomLayer.label)
    sets[bottomLayer.label] = {color: sets[b].color}

    // https://stackoverflow.com/questions/388996/regex-for-javascript-to-allow-only-alphanumeric keep only alphanumeric characters
    // https://github.com/vijithassar/d3-textwrap modified the node package to support client side javascript and for this project's purposes
    const wrap = textwrap(`${bottomLayer.label.replace(/[^a-z0-9]/gi,'')}-text`).bounds({height: 480, width: 100});

    // set layer text
    bottomLayer.pixelLayer.attr("id", bottomLayer.label)
        .selectAll("text,foreignObject").remove();
    bottomLayer.pixelLayer.attr("id", bottomLayer.label)
        .append("text")
        .text(bottomLayer.label)
        .call(wrap)
    
    bottomLayer.pixelLayer.selectAll("foreignObject")
        .attr('font-weight', "bold")
        .attr("y",100)
        .attr('font-size', `12px`)

    // remove top layer
    this.layers = layers.filter(e => e.label !== a);
    topLayer.pixelLayer.remove();
    updatePixelsInLayer(bottomLayer, sets[bottomLayer.label].color);
}

// converts all values to binary values
function normalizeToBinary() {
    // generalize later for different data sets --> stretch goal
    // This standarization of data method is specific to the animal data set
    elements.forEach(e => {
        e.legs = e.legs > 2 ? 1 : 0;
    });
}

// number of rows and columns calculated
function numberOfRowsCol(totalElements) {
    return Math.ceil(Math.sqrt(totalElements));
}

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
  
    return `rgb(${Math.round(Math.max(0, Math.min(1, r)) * 255)}, ${Math.round(Math.max(0, Math.min(1, g)) * 255)}, ${Math.round(Math.max(0, Math.min(1, b)) * 255)})`;   
  }