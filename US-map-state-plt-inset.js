console.clear();

var margins = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
};

var display_width = 400 - margins.left - margins.right;
var display_height = 300 - margins.bottom - margins.top;

var margin_choropleth = {
    top: 10,
    left: 10,
    bottom: 10,
    right: 10
},
width_choropleth = 857,
width_choropleth = width_choropleth - margin_choropleth.left - margin_choropleth.right,
mapRatio = .5,
height_choropleth = width_choropleth * mapRatio;

// D3 Projection
var projection = d3.geoAlbersUsa()
.scale(width_choropleth)
.translate([width_choropleth / 2, height_choropleth / 2]);

// Define path generator
var path = d3.geoPath()
.projection(projection);

var viewboxwidth = width_choropleth * 1;
var viewboxheight = height_choropleth - 20;

d3.json("us-states.json", function(json) {
var centered;
var formatComma = d3.format(',');
var fill = d3.scaleLog()
    .domain([10, 500])
    .range(["brown", "steelblue"]);

var svg_choropleth = d3.select("#usamap")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 " + viewboxwidth + " " + viewboxheight + "");

var map = svg_choropleth.append("g")
    .attr("id", "states")
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "0.1")
    .style("fill", function(d) {
        return fill(path.area(d));
    })
    .on("click", clicked);

svg_choropleth.append("g")
    .attr("class", "states-names")
    .selectAll("text")
    .data(json.features)
    .enter()
    .append("svg:text")
    .text(function(d) {
        return d.properties.name;
    })
    .attr("x", function(d) {
        return path.centroid(d)[0];
    })
    .attr("y", function(d) {
        return path.centroid(d)[1];
    })
    .attr("text-anchor", "middle")
    .attr("fill", "white");


function clicked(d) {

    var x, y, k;
    var state = d.properties.name;
    
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;

    } else {
        x = viewboxwidth / 2;
        y = viewboxheight / 2;
        k = 1;
        centered = null;
    }

    map.selectAll('path')
        .classed('active', centered && function(d) {
            return d === centered;
        });

    map.transition()
        .duration(750)
        .attr('transform', 'translate(' + viewboxwidth / 2 + ',' + viewboxheight / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');

    svg_choropleth.selectAll('text')
        .transition()
        .duration(750)
        .attr('transform', 'translate(' + viewboxwidth / 2 + ',' + viewboxheight / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
    
    d3.csv("asec_groupedvalues.csv", function (_error, data) {
        // Just an example here, changeable by selection in the map, you'll see
        /* var svg = d3.select("body")
        .append("svg")
        .attr("width", display_width + margins.left + margins.right)
        .attr("height", display_height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + ", " + margins.top + ")"); */

        var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.YEAR))
        .range([250,550]);
        
        svg_choropleth.append("g")
        .attr("transform", "translate(0,310)")
        .call(d3.axisBottom(x));
    
        var y = d3.scaleLinear()
        .domain([d3.min(data, d => d.POVERTY_LEVEL), d3.max(data, d => d.POVERTY_LEVEL)])
        .range([300,10]);
        
        svg_choropleth.append("g")
        .attr("transform", "translate(250,10)")
        .call(d3.axisLeft(y));
        
        var data = data.filter(d => d.STATE === state);
        var points = svg_choropleth.selectAll("circle")
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
    
        svg_choropleth.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function(d) { return x(d.YEAR); })
            .y(function(d) { return y(d.POVERTY_LEVEL); }))
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5);
    });
    }
});
