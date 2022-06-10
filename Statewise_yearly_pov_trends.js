var margins = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
};

var display_width = 800 - margins.left - margins.right;
var display_height = 600 - margins.bottom - margins.top;

d3.csv("asec_groupedvalues.csv", function (_error, data) {
    // Just an example here, changeable by selection in the map, you'll see
    var svg = d3.select("body")
    .append("svg")
    .attr("width", display_width + margins.left + margins.right)
    .attr("height", display_height + margins.top + margins.bottom)
    .append("g")
    .attr("transform", "translate(" + margins.left + ", " + margins.top + ")");

    var x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.YEAR))
    .range([(margins.left * 4), display_width - (margins.right * 4)]);
    
    svg.append("g")
    .attr("transform", "translate(0, 570)")
    .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
    .domain([d3.min(data, d => d.POVERTY_LEVEL), d3.max(data, d => d.POVERTY_LEVEL)])
    .range([display_height - (margins.bottom * 2), (margins.top * 1)]);
    
    svg.append("g")
    .attr("transform", "translate("+ (margins.left * 4) + "," + (margins.top * 1) + ")")
    .call(d3.axisLeft(y));

    var data = data.filter(d => d.STATE === "Massachusetts");
    var points = svg.selectAll("circle")
    .data(data)
    .attr("cx", d => x(d.YEAR))
    .attr("cy", d => y(d.POVERTY_LEVEL))
    .attr("r", 2)
    .attr("fill", "black");

    points.exit().remove;

    points.enter().append("circle")
    .attr("r", 2)
    .attr("fill", "none")
    .merge(points)
    .attr("cx", d => x(d.YEAR))
    .attr("cy", d => y(d.POVERTY_LEVEL));

    svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", d3.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d.POVERTY_LEVEL); }))
    .attr("fill", "none")
    .attr("stroke", "yellow") //yellow for the phrase piss poor poverty
    .attr("stroke-width", 1.5);
});