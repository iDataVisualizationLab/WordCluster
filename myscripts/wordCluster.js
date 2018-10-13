/* Oct 2018
 * Tommy Dang, Assistant professor, iDVL@TTU
 * Huyen Nguyen, PhD student

 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var sizeW = 800;
var svgW;
var linkW;
var nodeW;
var nodes;
var links;

var groupPath = function (d) {
    var fakePoints = [];
    if (d.values.length == 2) {
        //[dx, dy] is the direction vector of the line
        var dx = d.values[1].x2 - d.values[0].x2;
        var dy = d.values[1].y2 - d.values[0].y2;

        //scale it to something very small
        dx *= 0.00001;
        dy *= 0.00001;

        //orthogonal directions to a 2D vector [dx, dy] are [dy, -dx] and [-dy, dx]
        //take the midpoint [mx, my] of the line and translate it in both directions
        var mx = (d.values[0].x2 + d.values[1].x2) * 0.5;
        var my = (d.values[0].y2 + d.values[1].y2) * 0.5;
        fakePoints = [[mx + dy, my - dx],
            [mx - dy, my + dx]];
        //the two additional points will be sufficient for the convex hull algorithm
    }
    //do not forget to append the fakePoints to the input data
    return "M" +
        d3.geom.hull(d.values.map(function (i) {
            return [i.x2, i.y2];
        })
            .concat(fakePoints))
            .join("L")
        + "Z";
}

function wordCluster(){
    svgW = svg.append("g")
                .attr("class", "svgW")
                .attr("transform", "translate(" + 0 + "," + 0 + ")");

   /* svgW.append("rect")
        .attr("class", "rect1")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", sizeW)
        .attr("height", sizeW)
        .style("stroke-opacity", 0.6)
        .style("stroke", "#00")
        .style("fill", "#fff");*/

    var graph = graphByMonths[2][selectedCut];
    nodes = graph.nodes;
    links = graph.links;
   
    
    var rScale = d3.scale.linear()
                    .range([3,10])
                    .domain([0, Math.sqrt(50)]);    

    var fill = d3.scale.category10();
    var groups = d3.nest()
        .key(function (d) {
            return d.community;
        })
        .entries(nodes);
    groups = groups.filter(function (d) {
        return d.values.length > 1;
    });
    var partition = [];
    groups.forEach(function (d) {
        var temp = [];
        d.values.forEach(function (e) {
            temp.push(e.id);
        })
        partition.push(temp);
    });

  
   

     groupW =  svgW.selectAll("path")
        .data(groups)
        .attr("d", groupPath)
        .enter().append("path", "circle")
        .style("fill", "#000")
        .style("stroke", "#000")
        .style("stroke-width", 14)
        .style("stroke-linejoin", "round")
        .style("opacity", 0.2);


// Link Scales ************************************************************
    linkW = svgW.selectAll(".linkWordCluster")
        .data(links)
        .enter().append("line")
        .attr("class", "linkWordCluster")
        .style("stroke-opacity", 0.6)
        .style("stroke", "#000")
        .style("stroke-width", function (d) {
           
            return linkScale3(d.count);
        });


    nodeW = svgW.selectAll(".nodeWordCluster")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "nodeWordCluster")
        .attr("r", function(d){
            return rScale(d.count);
        })
        .style("stroke", "#000")
        .style("stroke-width", 0.02)
        .style("stroke-opacity", 1)
        .style("fill",function(d){
                return getColor3(d.category);
        })
        .on("mouseover", function(d){
            showTip(d, this);
        })
        .on("mouseout", function(d){
            hideTip(d);
        });
}

function  tickWordCLuster(){
     nodes.forEach(function(d){
        d.x2 = d.x*10;
        d.y2 = d.y*10-300;
    });

    nodeW.attr("cx", function (d) { return d.x2; })
        .attr("cy", function (d) { return d.y2; });   
    
    linkW.attr("x1", function (d) { return d.source.x2;})
        .attr("y1", function (d) { return d.source.y2;})
        .attr("x2", function (d) { return d.target.x2; })
        .attr("y2", function (d) { return d.target.y2; });
    groupW.attr("d", groupPath);   
}
