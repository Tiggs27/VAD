const svg_lisbon = d3.select("#map_lisbon"),
    width_lisbon = +svg_lisbon.attr("width"),
    height_lisbon = +svg_lisbon.attr("height");

const svg_legend = d3.select("#legend_map")
svg_legend_w = svg_legend.attr("width")
svg_legend_h = svg_legend.attr("height");

const svg_porto = d3.select("#map_porto")
width_porto = +svg_porto.attr("width"),
    height_porto = +svg_porto.attr("height");


const margin={top:20,left:65};
const color_pie = d3.scaleOrdinal()
    .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3'])

const color = ["#FF2D00"]

//let scale = 28000;
let data_by_city;
let array =[]
let promises =[
    d3.csv("../data/listing_inicial.csv",function(d) {
        return {
            latitude:d.latitude,
            longitude:d.longitude,
            room_type:d.room_type,
            city:d.city,
            neighbourhood_group:d.neighbourhood_group,
            price:d.price

        }}),

    d3.json("../data/neighbourdhoods_group_lisboa.geojson"),
    d3.csv("../data/neigh_coord_medias_lisboa.csv",function(d){
        return{
            x:d.MEAN_X,
            y:d.MEAN_Y,
            neighbourhood_group:d.neighbourhood_group
        }
    }),
    d3.json("../data/neighbourdhoods_group_porto.geojson"),
    d3.csv("../data/neigh_coord_medias_porto.csv",function(d){
        return{
            x:d.MEAN_X,
            y:d.MEAN_Y,
            neighbourhood_group:d.neighbourhood_group
        }
    })

];

Promise.all(promises).then(draw);

function draw(data){
    let list_ini = data[0];
    let geojson_lisb = data[1];
    let mean_coord_lisb = data[2];

    let geojson_porto = data[3]
    let mean_coord_porto = data[4]

    let data_map = list_ini.filter(function(d){
        return d.city == "Lisboa";
    })

    let count_rooms = d3.rollup(data_map,
        function (d) {
            return d3.count(d, function (t) {return t.price});},
        function (d) {
            return d.neighbourhood_group}); // agrupa por neighbourdhood_group

    console.log("count",count_rooms)
    quantity_scale = [0,100,300,500,1000,1500,12000,13000]
    x_scale_legend = [20,60,100,140,180,220,260,300]

    var colorScaleQuantity= d3.scaleThreshold()
        .domain(quantity_scale)
        .range(
            ['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000']);


    let unique_types = map_pie(28000,geojson_lisb,list_ini,"Lisboa",mean_coord_lisb,svg_lisbon,width_lisbon,height_lisbon,colorScaleQuantity)
    const color_legend = d3.scaleOrdinal()
        .domain(unique_types)
        .range(['#fef0d9','#fdcc8a','#fc8d59','#d7301f']);

    map_pie(26000,geojson_porto,list_ini,"Porto",mean_coord_porto,svg_porto,width_porto,height_porto,colorScaleQuantity)
    svg_lisbon.selectAll("dot")
        .data(unique_types)
        .enter()
        .append("circle")
        .attr("cx", 30)
        .attr("cy", function(d,i){ return 200 + i*30})
        .attr("r", 8)
        .style("fill", function(d){ return color_pie(d)})

    svg_lisbon.selectAll("text")
        .data(unique_types)
        .enter()
        .append("text")
        .attr("x", 45)
        .attr("y", function(d,i){return 205 + i*30})
        .style("fill","black")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("font-size", "15px")

    svg_lisbon.append("text")
        .attr("x", 30)
        .attr("y", function(d,i){return  165})
        .style("fill","black")
        .text("TYPES OF ROOM (%)")
        .attr("text-anchor", "left")
        .style("font-size", "17px")
        .style("font-weight",400)
        .style("letter-spacing", "2px")
        .style("font-family", 'Montserrat')
    


    svg_legend.selectAll("rect")
        .data(quantity_scale)
        .enter()
        .append("rect")
        .attr("x",function(d,i){
            return x_scale_legend[i];
        })
        .attr("y",function(d,i){
            return 10
        })
        .attr("height",20)
        .attr("width",function(d,i){
            return (x_scale_legend[1]-x_scale_legend[0])
        })
        .attr("fill",function(d,i){
            console.log("cor",colorScaleQuantity(d))
            return colorScaleQuantity(d)
        })

    svg_legend.selectAll("text")
        .data(quantity_scale)
        .enter()
        .append("text")
        .attr("y",function(d,i){
            return 42;
        })
        .attr("x",function(d,i){
            return x_scale_legend[i];
        })
        .text(function(d,i){
            return d
        })

        .attr("text-anchor", "left")
        .style("font-size", "11px")
    
    
}


function map_pie(scale,geojson,list_ini,city,mean_coord,svg,width,height,colorScaleQuantity){
    console.log("width",width,city)
    console.log("height",height,city)
    let data_map = list_ini.filter(function(d){
        return d.city == city;
    })

    types_room = d3.map(data_map, function(d){return d.room_type;})
    let unique_types = types_room.filter((v, i, a) => a.indexOf(v) === i);

    let count_rooms = d3.rollup(data_map,
        function (d) {
            return d3.count(d, function (t) {return t.price});},
        function (d) {
            return d.neighbourhood_group}); // agrupa por neighbourdhood_group
    console.log("mean",mean_coord)

    const map_coor = new Map(
        mean_coord.map(element =>{
            return [element.neighbourhood_group,[element.x,element.y]]
        })
    )
    number_rooms=Array.from(count_rooms.values())
    neigh_rooms=Array.from(count_rooms.keys())
    array = []
    console.log("neigh_rooms",neigh_rooms)
    //percorrer todos os neighbourhood_group
    let group_neigh = d3.group(data_map, d => d.neighbourhood_group)
    for (let i = 0; i < neigh_rooms.length; i++) {
        let grouped_neigh = group_neigh.get(neigh_rooms[i]);
        let group_type = d3.group(grouped_neigh, d => d.room_type)
        dict = {}
        dict["neighbourhood_group"] = neigh_rooms[i]
        dict["longitude"] = map_coor.get(neigh_rooms[i])[0]
        dict["latitude"] = map_coor.get(neigh_rooms[i])[1]
        for (let j = 0; j < unique_types.length; j++) {
            if (group_type.has(unique_types[j])){
                let percentage =(group_type.get(unique_types[j]).length/grouped_neigh.length)*100
                dict[unique_types[j]] = percentage
            }else{
                dict[unique_types[j]] = 0
            }

            map_coor.get(neigh_rooms[i])
        }
        array.push(dict)

    }
    console.log("ARRAY_LISBON",array)

    let array_for_pie = []
    array.forEach(neigh => {
        let values = []
        let values_neigh = []
        for (let i = 0; i < unique_types.length; i++) {
            values = []
            values.push(unique_types[i])
            const one_element = neigh[unique_types[i]]
            values.push(one_element)
            values_neigh.push(values)
        }
        array_for_pie.push(values_neigh)

    });

    const radius = 16;
    const data_ready=[]


    let center = d3.geoCentroid(geojson)
    let transla = [width/2,height/2]
    let projection = d3.geoMercator().scale(scale).center(center)
        .translate(transla);

    let path = d3.geoPath().projection(projection);
    var bounds = path.bounds(geojson);
    transla  = [width - (bounds[0][0] + bounds[1][0])/2,
        height - (bounds[0][1] + bounds[1][1])/2];

    projection = d3.geoMercator()
        .center(center)
        .scale(scale).translate(transla);
    path = d3.geoPath().projection(projection);

    svg.append("g")
        .attr("transform","translate(100,0)")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill",function(d){
            let neighbourd_group = d.properties.neighbourhood_group
            let valor = count_rooms.get(neighbourd_group)
            return colorScaleQuantity(valor);

        })
        .style("stroke","black")
        .style("stroke-width",0.5)
        .attr("name_neighbourhood_group",function(d,i){
            let neighbourd_group = d.properties.neighbourhood_group
            return neighbourd_group
        })
        .attr("quantity",function(d,i){
            let neighbourd_group = d.properties.neighbourhood_group
            let valor = count_rooms.get(neighbourd_group)
            console.log("value",valor)
            return valor
        })
        .on("mouseover",function(d,i){
                d.target.setAttribute("style", "stroke: black; stroke-width: 1")
                let neigh = i.properties.neighbourhood_group
                let valor = count_rooms.get(neigh)
                //d3.select(this).style("fill","black")
                d3.select("#neighbourhood_group").text(neigh.toUpperCase())
                d3.select("#quantity").text(valor)
                d3.select("#tooltip")
                    .style('left',(d.pageX)+'px')
                    .style('top',(d.pageY)+'px')
                    .style("display","block")
                    .style("visibility","visible")
                    .style("opacity",0.8)
                    .style("cursor", "pointer");
                    

            }
        )
        .on("mouseout",function(d){
            d.target.setAttribute("style", "stroke: black; stroke-width: 0.5")
            d3.select("#tooltip")
                .style("visibility","hidden")
                .style("cursor", "default");
        })


    let arc = d3.arc()
        .innerRadius(5)
        .outerRadius(radius);

    console.log("ARRAY WIRB VALUES",array_for_pie)


    const pie = d3.pie()
        .value(function(d) {return d[1]})
    console.log("ARRAY PIE",array_for_pie)

    array_for_pie.forEach(line => {
        data_ready.push(pie(line))
    });

    console.log("DATA_READY",data_ready)


    let g2 = svg.append("g")
    let points=g2.selectAll("g")
        
        .data(array)
        .enter()
        .append("g")
        .attr("transform",function(d) { return "translate("+projection([d.longitude,d.latitude])+")" })
        //.attr("transform","translate(0,0)")
        .append("g").attr("class","pies");


    let pies = points.selectAll(".pies")
        .data(function (d,i) {
            console.log(data_ready[i])
            return data_ready[i]
        })
        .enter()
        .append('g')
        .attr("transform","translate(100,0)")
        .attr('class',"arc");

    pies.append("path")
        .attr("d",arc)
        .attr("fill",function(d,i){
            return color_pie(i);
        })
        .attr("stroke", "black")
        .style("stroke-width", "0.1px")

    
    return unique_types;

}