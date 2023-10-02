const svg_porto_shared = d3.select("#map_porto_shared"),
    width_porto_shared = +svg_porto.attr("width"),
    height_porto_shared = +svg_porto.attr("height");

const svg_legend_shared = d3.select("#legend"),
    width_legend_shared = +svg_legend.attr("width"),
    height_legend_shared = +svg_legend.attr("height");
console.log(width_legend_shared)
console.log(height_legend_shared)

let scale_sha = 22000;;
var aux_dict = {};
var teste = new Array();


let promises_shared =[
    d3.csv("../data/Porto_sha.csv",function(d) {
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

Promise.all(promises_shared).then(draw_lisbon);

function draw_lisbon(lisbon_map) {
    let geojson = lisbon_map[1];
    let lat_long = lisbon_map[0];
    //data lisboa

    let data_lisbon = lat_long.filter(function (d) {
        return d.city == "Porto" && d.types_room == "Shared room";
    })

    let neighbourdhood = d3.map(lat_long, function (d) {
        return d.neighbourhood_group;
    })
    let unique_neigh = neighbourdhood.filter((v, i, a) => a.indexOf(v) === i);

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

    let prices_scale = [-1,50,84, 87, 90, 92, 94, 96,98]
    // Data and color scale

    var colorScale = d3.scaleThreshold()
        .domain(prices_scale)
        .range(d3.schemeReds[9]);


    let center = d3.geoCentroid(geojson)
    let transla = [width_porto_shared / 2, height_porto_shared / 2]
    let projection = d3.geoMercator().scale(scale_sha).center(center)
        .translate(transla);

    let path = d3.geoPath().projection(projection);
    var bounds = path.bounds(geojson);
    transla = [width_porto_shared - (bounds[0][0] + bounds[1][0]) / 2,
        height_porto_shared - (bounds[0][1] + bounds[1][1]) / 2];

    projection = d3.geoMercator()
        .center(center)
        .scale(scale_sha).translate(transla);

    path = d3.geoPath().projection(projection);

    const values = [0, 10, 20, 30, 40, 50, 60, 70, 80]

    svg_porto_shared.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            let neighbourd_group = d.properties.neighbourhood_group
            console.log(neighbourd_group)
            let conta = lowest_value.get(neighbourd_group)
            //teste.append(price)
            //lowest_value.sort(function (a,b){return a-b});
            console.log("per", conta)
            if(conta !== undefined){
                return colorScale(conta);
            }
            else {
                return colorScale(-1);
            }

        })
        .attr("name_neighbourhood_group", function (d, i) {
            let neighbourd_group = d.properties.neighbourhood_group
            return neighbourd_group
        })
        .attr("price", function (d, i) {
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
