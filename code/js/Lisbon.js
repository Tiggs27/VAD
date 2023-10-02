const svg_price = d3.select("#map_price"),
    width_price = +svg_price.attr("width"),
    height_price = +svg_price.attr("height");

const svg_legend_price = d3.select("#legend_price"),
    svg_legend_price_w = +svg_legend_price.attr("width"),
    svg_legend_price_h = +svg_legend_price.attr("height");

const grouped_graph_price = d3.select("#graph_price")
svg_grouped_price_w =+ grouped_graph_price.attr("width"),
    svg_grouped_price_h =+ grouped_graph_price.attr("height");


const svg_review = d3.select("#map_review"),
    width_review = +svg_price.attr("width"),
    height_review = +svg_price.attr("height");

const svg_legend_review = d3.select("#legend_review"),
    svg_legend_review_w = +svg_legend_review.attr("width"),
    svg_legend_review_h = +svg_legend_review.attr("height");

const grouped_graph_review = d3.select("#graph_review")
svg_grouped_review_w =+ grouped_graph_review.attr("width"),
    svg_grouped_review_h =+ grouped_graph_review.attr("height");

let graph_width = 400
let graph_height = 200

let margin_price = {top:55,left:150}
let margin_review={top:35,left:150}
let scale = 17000;
let data_by_city;
let mouse_legend = d3.select('#tooltip')


let promises =[
    d3.csv("../data/listing.csv",function(d) {
        return {
            room_type:d.room_type,
            city:d.city,
            neighbourhood_group:d.neighbourhood_group_cleansed,
            price:d.price,
            review:d.review_scores_rating

        }}),

    d3.json("../data/neighbourdhoods_group_lisboa.geojson")

];

Promise.all(promises).then(draw_lisbon);

function draw_lisbon(lisbon_map){
    let geojson = lisbon_map[1];
    //console.log("geojson",geojson)
    let lat_long = lisbon_map[0];
    //console.log("lat_log",lat_long)
    //data lisboa
    let data_lisbon = lat_long.filter(function(d){
        return d.city == "Lisboa";
    })

    let mean_price = d3.rollup(data_lisbon,
        function (d) {
            return d3.mean(d, function (t) {return t.price});}, // retorna a media por ano
        function (d) {
            return d.neighbourhood_group});

    //console.log("mean price", mean_price)
    let mean_review = d3.rollup(data_lisbon,
        function (d) {
            return d3.mean(d, function (t) {return t.review});}, // retorna a media por ano
        function (d) {
            return d.neighbourhood_group});

    //console.log("mean review", mean_review)

    let prices_scale = [30, 50, 70, 100, 130, 150,170,200]
    let reviews_scale = [1,4,4.4,4.6,4.7,4.8,4.9,5]
    var colorScalePrices = d3.scaleThreshold()
        .domain(prices_scale)
        .range(d3.schemeBlues[9]);

    var colorScaleReview = d3.scaleThreshold()
        .domain(reviews_scale)
        .range(["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]);


    let x_scale_legend = [0,25,50,75,100,125,150,175,200]
    draw_map("price",prices_scale,colorScalePrices,x_scale_legend,scale,geojson,svg_price,svg_legend_price,mean_price,width_price,height_price)
    x_scale_legend = [25,50,75,100,125,150,175,200,225]
    draw_map("review",reviews_scale,colorScaleReview,x_scale_legend,scale,geojson,svg_review,svg_legend_review,mean_review,width_review,height_review)

    draw_graph("price",data_lisbon,grouped_graph_price)
    draw_graph("review",data_lisbon,grouped_graph_review)
}


function draw_graph(type,data_lisbon,grouped_graph){
    let neighbourdhood = d3.map(data_lisbon, function(d){return d.neighbourhood_group;})
    neighbourdhood = neighbourdhood.filter((v, i, a) => a.indexOf(v) === i);
    //console.log(neighbourdhood)
    let neigh_group = d3.group(data_lisbon, d => d.neighbourhood_group)

    let count_room = d3.map(data_lisbon,function(d){return d.room_type})
    let unique_rooms = count_room.filter((v, i, a) => a.indexOf(v) === i);

    if (type =="price"){
        margin=margin_price
    }else{
        margin = margin_review
    }
    let array_dict = new Array()
    neighbourdhood.forEach(city => {
        dict = {}
        data_by_city = neigh_group.get(city)
        //console.log("neigh_group",data_by_city,city)
        let room_city= d3.group(data_by_city, d => d.room_type)
        dict["neighbourhood_group"] = city
        for (let i = 0; i < unique_rooms.length; i++) {
            const element = unique_rooms[i];
            let keys = Array.from(room_city.keys())
            if (keys.includes(element)){
                let info_room = room_city.get(element)
                if (type == "price"){
                    let value_per_room = d3.mean(info_room, function(d) { return +d.price; })
                    dict[element]= value_per_room
                }else{
                    let value_per_room = d3.mean(info_room, function(d) { return +d.review; })
                    dict[element]= value_per_room
                }


            }else{
                dict[element] = '0'
            }

        }
        array_dict.push(dict)

    });
    //console.log("dicio",array_dict)

    let groups = neighbourdhood
    //console.log("groups",groups)


    let subgroups = unique_rooms
    //console.log("subgroup",subgroups)

    let graph = grouped_graph.append("g")
        .attr("transform", 'translate('+margin.left+','+(margin.top)*2+')')

    let colorGraph = d3.scaleOrdinal()
        .domain(groups)
        .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3'])

    let max_y
    if (type == "price"){
        max_y = 450
    }else{
        max_y = 21
    }

    let yScale_graph = d3.scaleLinear()
        .domain([0,max_y])
        .range([graph_height,0])

    let yAxis_graph = d3.axisLeft()
        .scale(yScale_graph)

    grouped_graph.append("g")
        .attr('transform','translate('+margin.left + ','+ (margin.top*2)+')')
        .call(yAxis_graph)
        .style("font-size", "8px")



    if (type =="price"){
        grouped_graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",margin.left - 40)
            .attr("x",-graph_height/2-margin.top)
            .text("Mean Price")
            .style("text-anchor", "end")

        grouped_graph.append("text")
            .attr("y",margin.top+30)
            .attr("x",graph_width/2-60)
            .text("MEAN PRICE OF EACH ROOM TYPE BY NEIGHBOURHOOD GROUP")
            .style("font-size", "12px")
            .style("font-weight",550)
            .style("letter-spacing", "1px")
            .style("font-family", 'Montserrat')

        grouped_graph.selectAll("dot")
            .data(subgroups)
            .enter()
            .append("circle")
            .attr("cx", svg_grouped_price_w-margin.left+30)
            .attr("cy", function(d,i){ return 120 + i*15})
            .attr("r", 4)
            .style("fill", function(d){ return colorGraph(d)})
            

        grouped_graph.append("g")
            .attr("transform","translate(100,100)")
            .selectAll("text")
            .data(subgroups)
            .enter()
            .append("text")
            .attr("x", svg_grouped_price_w-margin.left-60)
            .attr("y", function(d,i){return 25 + i*15})
            .style("fill","black")
            .text(function(d){
                console.log("legenda ",d)
                return d;})
            .attr("text-anchor", "left")
            .style("font-size", "10px")
            .style("font-family", 'Montserrat')

    }else{
        grouped_graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y",margin.left -30)
            .attr("x",-graph_height/2-margin.top)
            .text("Mean Review")
            .style("text-anchor", "end")
            

        grouped_graph.append("text")
            .attr("y",margin.top)
            .attr("x",graph_width/2-85)
            .text("MEAN REVIEW OF EACH ROOM TYPE BY NEIGHBOURHOOD GROUP")
            .style("font-size", "12px")
            .style("font-weight",550)
            .style("letter-spacing", "1px")
            .style("font-family", 'Montserrat')
    }
    let xScale_graph = d3.scaleBand()
        .domain(groups)
        .range([0,graph_width])
        .padding([0.1])

    let xAxis_graph = d3.axisBottom()
        .scale(xScale_graph)

        
    grouped_graph.append("g")
        .attr('transform','translate('+margin.left + ','+ ((margin.top*2)+graph_height)+')')
        .call(xAxis_graph)
        .selectAll("text")
        .attr("transform", "translate(-10,1)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", margin.left/2)
        .attr("y", graph_height)

    let stackedData = d3.stack()
        .keys(subgroups)

    let stackedSeries = stackedData(array_dict)

    //console.log("stacked data",stackedSeries)

    graph.append("g")
        .selectAll("g")
        .data(stackedSeries)
        .enter().append("g")
        .attr("fill", function(d) {
            return colorGraph(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) {
            return d; })
        .enter().append("rect")
        .attr("x", function(d) {
            return xScale_graph(d.data.neighbourhood_group); })
        .attr("y", function(d) { return yScale_graph(d[1]); })
        .attr("height", function(d) { return yScale_graph(d[0]) - yScale_graph(d[1]); })
        .attr("width",xScale_graph.bandwidth())

}
function draw_map(type,colorScaleLegend,colorScale,x_scale_legend,scale,geojson,svg_map,svg_legend,data_mean,map_width,map_height){
    let center = d3.geoCentroid(geojson)
    let transla = [map_width/2,map_width/2]
    let projection = d3.geoMercator().scale(scale).center(center)
        .translate(transla);

    let path = d3.geoPath().projection(projection);
    var bounds = path.bounds(geojson);
    transla  = [width_price - (bounds[0][0] + bounds[1][0])/2,
        width_price - (bounds[0][1] + bounds[1][1])/2];

    projection = d3.geoMercator()
        .center(center)
        .scale(scale).translate(transla);

    path = d3.geoPath().projection(projection);

    svg_legend.selectAll("rect")
        .data(colorScaleLegend)
        .enter()
        .append("rect")
        .attr("x",function(d,i){
            return x_scale_legend[i];
        })
        .attr("y",function(d,i){
            return 0
        })
        .attr("height",7)
        .attr("width",function(d,i){
            return (x_scale_legend[1]-x_scale_legend[0])
        })
        .attr("fill",function(d,i){
            //console.log("cor",colorScale(d))
            return colorScale(d)
        })
    svg_legend.selectAll("text")
        .data(colorScaleLegend)
        .enter()
        .append("text")
        .attr("y",15)
        .attr("x",function(d,i){
            return x_scale_legend[i];
        })
        .text(function(d,i){
            if (type == "price"){
                return String(colorScaleLegend[i]).concat("€")
            }else{

                return String(colorScaleLegend[i])
            }})

        .attr("text-anchor", "left")
        .style("font-size", "9px")

    svg_map.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill",function(d){
            let neighbourd_group = d.properties.neighbourhood_group
            let valor = data_mean.get(neighbourd_group)
            return colorScale(valor);

        } )
        .attr("name_neighbourhood_group",function(d,i){
            let neighbourd_group = d.properties.neighbourhood_group
            return neighbourd_group
        })
        .attr("price",function(d,i){
            let neighbourd_group = d.properties.neighbourhood_group
            let valor = data_mean.get(neighbourd_group)

            valor = valor.toFixed(2)
            return valor
        })
        .style("stroke","black")
        .style("stroke-width",0.5)
        .on("mouseover",function(d,i){
            d.target.setAttribute("style", "stroke: black; stroke-width: 1")
            let neigh = i.properties.neighbourhood_group
            let valor = data_mean.get(neigh)
            valor = valor.toFixed(2)
            //d3.select(this).style("fill","black")
            if( type == "price"){
                d3.select("#neighbourhood_group").text(neigh)
                d3.select("#price").text(valor.concat("€"))
                d3.select("#tooltip")
                    .style('left',(d.pageX)+'px')
                    .style('top',(d.pageY)+'px')
                    .style("display","block")
                    .style("visibility","visible")
                    .style("opacity",0.8)
                    .style("cursor", "pointer");

            }else{
                d3.select("#neighbourhood_group").text(neigh)
                d3.select("#price").text(valor)
                d3.select("#tooltip")
                    .style('left',(d.pageX)+'px')
                    .style('top',(d.pageY)+'px')
                    .style("display","block")
                    .style("visibility","visible")
                    .style("opacity",0.8)
                    .style("cursor", "pointer");
            }


        })
        .on("mouseout",function(d){
            d.target.setAttribute("style", "stroke: black; stroke-width: 0.5")
            d3.select("#tooltip")
                .style("visibility","hidden")
                .style("cursor", "default");
        })
}