Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] == obj) {
			return true;
		}
	}
	return false;
}

function cleanArray(actual){
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
	  if (actual[i]){
		newArray.push(actual[i]);
	}
  }
  return newArray;
}

var margin = {top: 1, right: 1, bottom: 6, left: 1},
	width = 960 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
	format = function(d) { return formatNumber(d) + " galaxies"; },
	color = d3.scale.category20();

function updateData(gal_id){

	d3.select("svg").remove();

var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
	.nodeWidth(15)
	.nodePadding(10)
	.size([width, height]);

var path = sankey.link();

	d3.json("data/"+gal_id+".json", function(answers) {

	  $(".galaxy-image").attr("src", answers.image_url);

	  sankey
		  .nodes(answers.nodes)
		  .links(answers.links)
		  .layout(32);

	  var link = svg.append("g").selectAll(".link")
		  .data(answers.links)
		.enter().append("path")
		  .attr("class", "link")
		  .attr("d", path)
		  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		  .sort(function(a, b) { return b.dy - a.dy; });

	  link.append("title")
		  .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

	  var node = svg.append("g").selectAll(".node")
		  .data(answers.nodes)  
		.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.call(d3.behavior.drag()
		  .origin(function(d) { return d; })
		  .on("dragstart", function() { this.parentNode.appendChild(this); })
		  .on("drag", dragmove));

	  node.append("rect")
		  .attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth())
		  .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
		  .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
		.append("title")
		  .text(function(d) { return d.name + "\n" + format(d.value); });

	  node.append("text")
		  .attr("x", -6)
		  .attr("y", function(d) { return d.dy / 2; })
		  .attr("dy", ".35em")
		  .attr("text-anchor", "end")
		  .attr("transform", null)
		  .text(function(d) { return d.name; })
		.filter(function(d) { return d.x < width / 2; })
		  .attr("x", 6 + sankey.nodeWidth())
		  .attr("text-anchor", "start");
		
		node.filter(function(d) { return d.value == 0; })
		  .attr("x", -1000)
		  .attr("y", -1000)
		  .attr("width", 0)
		  .attr("height", 0)
		  .text("");

	  function dragmove(d) {
		d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
		sankey.relayout();
		link.attr("d", path);
	  }
	});

}

$("#galaxies").change(function() {
  updateData(this.value);
});