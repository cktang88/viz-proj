/*
data cleaning: split each .txt into header (category names) and body (data) segments
manually replace quotation marks, colons, equal signs, anything that isn't useful
note: .txt to .csv conversion done via https://www.browserling.com/tools/text-to-csv

NOTE: the data processing methods in loadData() are SPECIFIC to data derived from https://dtai.cs.kuleuven.be/CP4IM/datasets/
*/

var header = {};
var elements = [];
var sets = {};

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
                    obj[h.attribute] = h.value;
                }
                // console.log(obj)
                elements.push(obj)
                // console.log(elements)
            })
            console.log('elements: ')
            console.log(elements)

            Object.keys(header).forEach(e  => {
                let attr = header[e].attribute;
                if(attr in sets) // don't recompute repeated attrs
                    return;
                sets[attr] = [];
            });
            console.log('sets: ')
            console.log(sets)

            // plot
            plot_it();
        })
        .catch(err => console.error(err))
}

// plot all
function plot_it()  {
    standardizeData() // This is specific to the animal dataset, convert # legs to true/false value

    // user defined parameters
    const width = 200, height = 200;
    const margin = 2.5;
    const textPad = 20;
    // color of each true pixel
    const pixelColor = "#9fe9fc";
    // color of each false pixel
    const baseColor = "#3a3a3a";

    d3.select(".header").append('h1').style('text-align',"center").text(`OnSet Data Visualization`)
    d3.select(".header").append('p').style('text-align',"center").text(`Kwuang Tang and Kevin Jin, Course 3891 Intro to Visualization`)

    // number of rows and columns
    let rowcolNum = numberOfRowsCol(elements.length)
    console.log(elements.length, rowcolNum)
    // pixel width and X position
    let xScale = d3.scaleLinear().domain([0,rowcolNum]).rangeRound([0,width])
    // pixel height and Y position
    let yScale = d3.scaleLinear().domain([0,rowcolNum]).rangeRound([0,height])
    
    // function to plot each pixelLayer
    let plotPixelLayer = (attr) => {
        let pixelLayer = d3.select('.container').append('svg').attr('width', width).attr('height', height+textPad).style("margin",`${margin}px`)
        var main = pixelLayer.append('g').attr('transform', 'translate(0,'+textPad+')')
        pixelLayer.append('text').attr('x', width/2).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', '15px').attr('font-weight',"bold")
            .text(`${attr}`)
        main.append("g").selectAll(`pixel ${attr}`).data(elements).enter().append("rect")
            .attr("y", (d,i) => yScale(Math.floor(i/rowcolNum)))
            .attr("x", (d,i) => xScale(i%rowcolNum))
            .attr("width", xScale(1))
            .attr("height", yScale(1))
            .attr("fill", (d) => d[attr]=="true" ? pixelColor : baseColor)
            .attr("class", `pixel ${attr}`)
    } 

    // plot a pixelLayer for each animal attribute
    Object.keys(elements[0]).forEach((key) => {
        plotPixelLayer(key);
    })
       
}

// This standarization of data method is specific to the animal data set
function standardizeData() {
    elements.forEach((element) => {
        element.legs = element.legs > 2 ? "true" : "false";
    });
}

// number of rows and columns calculated
function numberOfRowsCol(totalElements) {
    return Math.ceil(Math.sqrt(totalElements));
}