/*
data cleaning: split each .txt into header (category names) and body (data) segments
manually replace quotation marks, colons, equal signs, anything that isn't useful
note: .txt to .csv conversion done via https://www.browserling.com/tools/text-to-csv

NOTE: the data processing methods in loadData() are SPECIFIC to data derived from https://dtai.cs.kuleuven.be/CP4IM/datasets/
*/

var header = {};
var elements = [];
var sets = {}; // dict of {attr: {attribute data obj}}

// execute main method
try {
    loadData();
} catch (e) {
    console.log(e);
}

// main method
function loadData() {
    // load headers
    d3.csv('./data/zoo-header.csv')
        .then(function (data) {
            // console.log(data);
            data.forEach(e => {
                // complicated method to add attributes to `headers` hashmap
                let keys = Object.keys(e);
                // console.log(keys);
                let obj = {
                    attribute: e[keys[1]],
                    value: e[keys[2]]
                };
                // console.log(obj)
                header[e[keys[0]]] = obj;
                // console.log(header)
            });
        })
        .then(() => {
            console.log('headers: ')
            console.log(header)
        })
        .catch(err => console.error(err))

    // load body elements
    d3.csv('./data/zoo-body.csv')
        .then(function (data) {
            // console.log(data);
            // structure data elements properly
            data.forEach(e => {

                let obj = {};
                for (var key in e) {
                    let h = header[e[key]]
                    if (h.value === "true" || h.value === "false") {
                        obj[h.attribute] = +(h.value === "true"); // convert from "true"/"false" to 0/1
                    }
                    else obj[h.attribute] = h.value;
                    // anything that isn't true/false will be normalized later
                }
                // console.log(obj)
                elements.push(obj)
                // console.log(elements)
            })
            console.log('elements: ')
            console.log(elements)

            Object.keys(header).forEach(e => {
                let attr = header[e].attribute;
                if (attr in sets) // don't recompute repeated attrs
                    return;
                sets[attr] = {
                    data: []
                };
            });
            console.log('sets: ')
            console.log(sets)
        })
        .then(normalizeToBinary) // This is specific to the animal dataset, convert # legs to true/false value
        .then(assignColors) // assign colors for each attr
        .then(plot_it) // plot
        .catch(err => console.error(err))
}

function assignColors() {
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    // console.log(colorScale)
    Object.keys(sets).forEach((attr, i) => {
        sets[attr].color = colorScale(i)
        // console.log(sets[attr])
    })
    // console.log(sets)
}

// function to plot each pixelLayer
const plotPixelLayer = (attr,index) => {

    // number of rows and columns
    const rowcolNum = numberOfRowsCol(elements.length);
    // console.log(elements.length, rowcolNum);

    // user defined parameters
    const width = 100,
        height = width,
        margin = 2.5,
        textPad = 20,
        pixelColor = "#9fe9fc", // color of each true pixel
        baseColor = "#3a3a3a"; // color of each false pixel

    const layerScale = d3.scaleLinear().domain([0, rowcolNum]).rangeRound,
        xScale = layerScale([0, width]), // pixel width and X position
        yScale = layerScale([0, height]) // pixel height and Y position

    let y = 0
    let x = 0
    const pixelLayer = d3.select('.container').append('svg')
        .attr('width', width)
        .attr('height', height + textPad)
        .attr('id', attr) // set ID equal to attr
        .style("margin", `${margin}px`)
        .attr("x", ()=> {
            let currOut = index*(width+margin)+2*width
            if (Math.floor(currOut/screen.width)!=Math.floor(((index-1)*(width+margin)+2*width)/screen.width)) {
                this.offset = -1*((currOut%screen.width)-2*width)
            }
            y = Math.floor(currOut/screen.width)
            x = (currOut%screen.width)-2*width+this.offset
            return x
        })
        .attr("y", ()=> {
            y = y*(width+textPad+margin)
            return y
        })
    this.layers.push({x: x, y: y, pixelLayer: pixelLayer})

    const main = pixelLayer.append('g').attr('transform', 'translate(0,' + textPad + ')')

    pixelLayer.append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '15px')
        //.attr('font-weight', "bold")
        .text(`${attr}`)

    main.append("g").selectAll(`pixel ${attr}`).data(elements).enter().append("rect")
        .attr("y", (d, i) => yScale(Math.floor(i / rowcolNum)))
        .attr("x", (d, i) => xScale(i % rowcolNum))
        .attr("width", xScale(1))
        .attr("height", yScale(1))
        .attr("fill", d => d[attr] > 0 ? sets[attr].color : baseColor)
        .attr("class", `pixel`)
        .attr("style", d => d.hoverOver ? "outline: thin solid red;" : "outline: none;")

        // mouse hover pixel anim
        .on('mouseover', d => {
            d.hoverOver = true
            //console.log(d)
        })
        .on('mouseout', d => d.hoverOver = false)

    pixelLayer.call(d3.drag()
    .on("start", function() {
        this.parentElement.appendChild(this); // bring to front
    })
    .on("drag", function() {
        d3.select(this).attr("x", d3.mouse(this)[0]-(width/2)).attr("y", d3.mouse(this)[1]-(width/2)); // follow mouse
    })
    .on("end", function() {
        let layerOne = findd3PixelLayer(d3.select(this))
        let mouseLoc = [d3.mouse(this)[0], d3.mouse(this)[1]]
        let layerTwo = getPixelLayerAtLoc(mouseLoc, width);
        if (!layerTwo) {
            console.log('layer2 not found.')
            return
        }
        console.log("layer 1 and 2:")
        console.log(layerOne)
        console.log(layerTwo)
    })
    );
}

let getPixelLayerAtLoc = (location,pixelWidth) => {
    return this.layers.find((obj) => obj.x < location[0] && obj.x+pixelWidth > location[0] &&  obj.y < location[1] && obj.y+pixelWidth > location[1])
}
let updatePixelLocation = (pixelLayer, location) => {
    let obj = this.layers.find((obj) => obj.pixelLayer == pixelLayer)
    obj.x = location[0]
    obj.y = location[1]
}

let findd3PixelLayer = (d3pixelLayer) => {
    return this.layers.find((obj) => Object.is(obj.pixelLayer, d3pixelLayer))
}

// plot all
function plot_it() {

    // plot a pixelLayer for each animal attribute
    let i = 0
    setGlobalVars();
    Object.keys(elements[0]).forEach((key) => {
        plotPixelLayer(key,i);
        i+=1
    })
    console.log(this.layers)
}

const setGlobalVars = () => {
    this.offset = 0;
    this.layers = [];
}

const JoinType = {
    AND: 0,
    OR: 1
}

/**
 * 
 * @param {String} a First attribute
 * @param {String} b Second attribute
 * @param {JoinType} joinType type of join (AND/OR)
 */
function combineLayer(a, b, joinType) {
    // when combining, basically make B the new layer
    // A is unchanged...
    if (!joinType)
        console.error(`Undefined join type.`)
    elements.forEach(e => {
        // if OR: add values
        if (joinType === JoinType.OR)
            e[b] += e[a]
        // if AND: if either zero, new val = 0, else add values
        if (joinType === JoinType.AND)
            e[b] = (e[b] * e[a] === 0) ? 0 : e[a] + e[b];
    })
    sets[b].lastJoinType = joinType; // record last join type of B, to display properly
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