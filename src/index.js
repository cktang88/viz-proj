/*
data cleaning: split each .txt into header (category names) and body (data) segments
manually replace quotation marks, colons, equal signs, anything that isn't useful
note: .txt to .csv conversion done via https://www.browserling.com/tools/text-to-csv

NOTE: the data processing methods in loadData() are SPECIFIC to data derived from https://dtai.cs.kuleuven.be/CP4IM/datasets/
*/

var header = {};
var elements = []

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
            console.log(data);
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
            console.log(data);
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
            plot_it();
        })
        .then(() => {
            console.log('elements: ')
            console.log(elements)
        })
        .catch(err => console.error(err))
}

// plot
function plot_it() {
    console.log('plotting...')
}