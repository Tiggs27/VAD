const svg_porto = d3.select("#map_porto"),
    width_lisbon = +svg_porto.attr("width"),
    height_lisbon = +svg_porto.attr("height");

const svg_legend = d3.select("#legend"),
    width_legend = +svg_legend.attr("width"),
    height_legend = +svg_legend.attr("height");

console.log(width_legend)
console.log(height_legend)
let array = new Array();
let lat = "";
let long = "";
let array_teste = new Array();
let scale = 22000;
let data_by_city;
let types_room;
let lisbon_bubble = new Array();
var aux_dict = {};

let mouse_legend = d3.select('#tooltip')

let promises =[
    d3.csv("../data/Porto_ent.csv",function(d) {
        return {
            latitude:d.latitude,
            longitude:d.longitude,
            city:d.city,
            types_room: d.room_type,
            neighbourhood_group:d.neighbourhood_group_cleansed,
            conta: d.conta

        }}),

    d3.json("../data/neighbourdhoods_group_porto.geojson")

];
const allGroup = ["Entire home/apt", "Private Room", "Shared Room","Hotel Room"]


Promise.all(promises).then(draw_porto);

function draw_porto(porto_map) {
    let geojson = porto_map[1];
    console.log("geojson", geojson)
    let lat_long = porto_map[0];
    //data lisboa

    let data_lisbon = lat_long.filter(function (d) {
        return d.city == "Porto" && d.types_room == "Entire home/apt";
    })

    let neighbourdhood = d3.map(lat_long, function (d) {
        return d.neighbourhood_group;
    })
    let unique_neigh = neighbourdhood.filter((v, i, a) => a.indexOf(v) === i);
    console.log(unique_neigh)

    let lowest_value = d3.rollup(data_lisbon,
        function (d) {
            teste = d3.min(d, function (t) {
                return +t.conta
            });
            return teste;
        },
        function (d) {
            return d.neighbourhood_group
        });
    console.log("lowest ", lowest_value)

    let prices_scale = [0,50,84, 87, 90, 92, 94, 96,98]
    // Data and color scale

    var colorScale = d3.scaleThreshold()
        .domain(prices_scale)
        .range(d3.schemeReds[9]);


    let center = d3.geoCentroid(geojson)
    let transla = [width_lisbon / 2, height_lisbon / 2]
    let projection = d3.geoMercator().scale(scale).center(center)
        .translate(transla);

    let path = d3.geoPath().projection(projection);
    var bounds = path.bounds(geojson);
    transla = [width_lisbon - (bounds[0][0] + bounds[1][0]) / 2,
        height_lisbon - (bounds[0][1] + bounds[1][1]) / 2];

    projection = d3.geoMercator()
        .center(center)
        .scale(scale).translate(transla);

    path = d3.geoPath().projection(projection);
    const x_scale = [0,20,40,60,80,100,120,140,160]
    const values = [0, 10, 20, 30, 40, 50, 60, 70, 80]
    svg_legend.selectAll("rect")
        .data(prices_scale)
        .enter()
        .append("rect")
        .attr("x",function(d,i){
            return x_scale[i];
        })
        .attr("y",function(d,i){
            return 0
        })
        .attr("height",20)
        .attr("width",function(d,i){
            return (x_scale[1]-x_scale[0]+0)
        })
        .attr("fill",function(d,i){
            return colorScale(d)
        })
    svg_legend.selectAll("text")
        .data(prices_scale)
        .enter()
        .append("text")
        .attr("y",function(d,i){
            return 30;
        })
        .attr("x",function(d,i){
            return x_scale[i];
        })
        .text(function(d,i){
            testeteste=String(prices_scale[i]).concat("%")
            console.log(testeteste)
            return testeteste
        })
        .attr("text-anchor", "left")
        .style("font-size", "8px")

    svg_porto.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            let neighbourd_group = d.properties.neighbourhood_group
            console.log(neighbourd_group)
            let conta = lowest_value.get(neighbourd_group)
            console.log("per", conta)
            if(conta !== undefined){
                return colorScale(conta);
            }
            else {
                return colorScale(0);
            }
        })
        .attr("name_neighbourhood_group", function (d, i) {
            let neighbourd_group = d.properties.neighbourhood_group
            return neighbourd_group
        })
        .attr("conta", function (d, i) {
            let neighbourd_group = d.properties.neighbourhood_group
            let conta = lowest_value.get(neighbourd_group)
            //price = price.toFixed(2)
            return conta
        })
        .style("stroke","black")
        .style("stroke-width",0.5)
        .on("mouseover",function(d,i){
            d.target.setAttribute("style", "stroke: black; stroke-width: 1")

            let neigh = i.properties.neighbourhood_group
            let conta = lowest_value.get(neigh)
            if(conta !== undefined){
                conta_v2 = conta.toFixed(2)
                console.log(conta_v2)
            }
            else{
                conta = 0
                conta_v2 = conta.toFixed(2)
                console.log(conta_v2)
            }
            d3.select("#neighbourhood_group").text(neigh)
            d3.select("#conta").text(conta_v2.concat("%"))
            d3.select("#tooltip")
                .style('left',(d.pageX)+'px')
                .style('top',(d.pageY)+'px')
                .style("display","block")
                .style("visibility","visible")
                .style("opacity",0.8)
                .style("cursor", "pointer");

        })
        .on("mouseout",function(d){
            d.target.setAttribute("style", "stroke: black; stroke-width: 0.5")

            d3.select("#tooltip")
                .style("visibility","hidden")
                .style("cursor", "default");
        });
}



