/*
data cleaning: split each .txt into header (category names) and body (data) segments
manually replace quotation marks, colons, equal signs, anything that isn't useful
note: .txt to .csv conversion done via https://www.browserling.com/tools/text-to-csv
*/

let header;

// execute main method
try {
    loadData();
} catch (e) {
    console.log(e);
}

// main method
function loadData() {
    d3.csv('./data/zoo-header.csv')
        .then(function (data) {
            console.log(data);
            data.forEach(e => {
                let keys = Object.keys(e);
                header[keys[0]] = {
                    attribute: e[keys[1]],
                    value: e[keys[2]]
                }
                console.log(header[keys[0]])
            });
        })
        .then(() => {
            console.log('headers: ' + header)
        })

    d3.csv('./data/zoo-body.csv')
        .then(function (data) {
            console.log(data);
            plot_it();
        })
}

// plot
function plot_it() {
    console.log('plotting...')
}