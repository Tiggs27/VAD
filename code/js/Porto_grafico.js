const margin_graf_porto = {top: 100, right: 20, bottom: 100, left: 50},
    width = 960 - margin_graf_porto.left - margin_graf_porto.right,
    height = 400 - margin_graf_porto.top - margin_graf_porto.bottom;

// append the svg object to the body of the page
const svg = d3.select("#map_porto")
    .append("svg")
    .attr("width", width + margin_graf_porto.left + margin_graf_porto.right)
    .attr("height", height + margin_graf_porto.top + margin_graf_porto.bottom)
    .append("g")
    .attr("transform",`translate(${margin_graf_porto.left},${margin_graf_porto.top})`);

let dataReady, x, y, myColor;

//Read the data
d3.csv("../data/Porto_preco_analise.csv").then(function(data) {
    //console.log(data)
    // List of groups (here I have one group per column)
    const allGroup = ["Porto","Vila Nova de Gaia","Matosinhos","Vila do Conde","Povoa de Varzim","Espinho","Gondomar","Arouca","Maia","Santa Maria da Feira","Paredes","Vale de Cambra","Oliveria de Azemeis","Santo Tirso","Valongo","São Joao da Madeira","Trofa"]

    let dates = [];

    // Reformat the data: we need an array of arrays of {x, y} tuples
    dataReady = allGroup.map( function(grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function(d) {
                if (dates.indexOf(d.date) === -1) dates.push(d.date);
                return {tempo: d.date, value: +d[grpName]}; //Transforma a data em string
            })
        };
    });
    // I strongly advise to have a look to dataReady with
    console.log(dataReady);


    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(d => d) // text showed in the menu
        .attr("value", d => d) // corresponding value returned by the button

    // A color scale: one color for each group
    myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    x = d3.scalePoint()
        .domain(dates)
        .range([0, width/2.5]);

    svg.append("g")
        .attr("class","axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        //.tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".5em")
        .attr("transform", "rotate(-65)");

    // Add Y axis
    y = d3.scaleLinear()
        .domain( [0,500])
        .range([ height, 0 ]);

    svg.append("g")
        .call(d3.axisLeft(y));

    let line_groups = svg.append('g').attr('class', 'linhas');

    line_groups
        .selectAll("path")
        .data(dataReady)
        .join('path')
        .attr("d", d =>
            d3.line()
                .x(d => x(d.tempo))
                .y(d => y(d.value))
                (d.values)
        )
        .attr("stroke", d => myColor(d.name))
        .style("fill", "none")
        .attr('class', d => d.name.replace(/\s+/g, ""));

    // Add the points

    let dot_groups = svg.append('g').attr('class', 'dots');
    dot_groups
        .selectAll("g")
        .data(dataReady)
        .enter()
        .append('g')
        .attr('class', d => d.name.replace(/\s+/g, ""))
        .style("fill", function(d){ return myColor(d.name) })
        .selectAll("circle")
        .data(function(d){ return d.values })
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.tempo) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 2);




    d3.select("#selectButton").on("change", function(event, d) {
        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })
})

function update(selectedGroup) {

    let line_groups = svg.selectAll('.linhas');
    line_groups.selectAll('path').style('display', 'none');

    line_groups.selectAll('path.'+selectedGroup.replace(/\s+/g, ""))
        .style('display', 'block');

    let dot_groups = svg.selectAll('.dots');
    dot_groups.selectAll('g').style('display', 'none');

    dot_groups.selectAll('g.'+selectedGroup.replace(/\s+/g, ""))
        .style('display', 'block');
}