let svg;
let canvasHeight, canvasWidth, padding, graphWidth, graphHeight;

window.onload = function() {// atributos do gráfico
    canvasHeight =500;
    canvasWidth = 1000;
    let margin = {top: 200, left: 150};
    graphHeight = 200;
    graphWidth = 200;
    // novo elemento svg no canvas
    svg = d3.select('body')
        .append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight);

    d3.csv("../data/listing.csv", function (data) {
        return {
            price: parseInt(data.price),
            neighbourdhood: data.neighbourdhood_cleansed,
            neighbourdhood_group:data.neighbourdhood_group_cleansed,
            latitude:parseInt(data.latitude),
            longitude: parseInt(data.longitude),
            city:data.city,
            room_type:data.room_type
        
        }
    }).then(function (data) {
        type_city(data,"price",margin);
        margin = {top: 200, left: canvasWidth-graphWidth-30};
        type_city(data,"quantity",margin)
        margin = {top: 200+graphWidth, left: canvasWidth-graphWidth-30};
        types_room(data,margin)
    });
}

