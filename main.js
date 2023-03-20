const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500; 
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 

const FRAME1 = d3.select("#vis-1") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame"); 

function build_scatter() {
  // Load csv
  d3.csv("data.csv").then((data) => {
    
    // Define scale functions that maps our data values 
    // (domain) to pixel values (range)

	const MAX_X = d3.max(data, (d) => {
		return parseInt(d.PTS)})

	const MIN_X = d3.min(data, (d) => {
		return parseInt(d.PTS)})

	const AVG_X = d3.mean(data, (d) => {
		return parseInt(d.PTS)})

    const X_SCALE = d3.scaleLinear() 
                      .domain([MIN_X, MAX_X + AVG_X]) //the x-axis range
                      .range([0, VIS_WIDTH]);

    const MAX_Y = d3.max(data, (d) => {
		return parseInt(d.EFF)})

	const MIN_Y = d3.min(data, (d) => {
		return parseInt(d.EFF)})

	const AVG_Y = d3.mean(data, (d) => {
		return parseInt(d.EFF)})

    // Define scale functions that maps our data values 
    // (domain) to pixel values (range)
    const Y_SCALE = d3.scaleLinear() 
                      .domain([MIN_Y, MAX_Y + AVG_Y]) // the y-axis range
                      .range([VIS_HEIGHT,0]);
 

    // Plots the petal and sepal length points with 50% opacity and 
    // colors accordingly to species type
    const circles = FRAME1.selectAll("points")  
        .data(data) // passed from .then  
        .enter()       
        .append("circle")  
          .attr("cx", (d) => { return (X_SCALE(d.PTS) + MARGINS.left); }) 
          .attr("cy", (d) => { return (Y_SCALE(d.EFF) + MARGINS.top); }) 
          .attr("r", 4)
          .attr("class", "point")
          .attr("opacity", "50%");

    // adds x axis labels
    FRAME1.append("g") 
          .attr("transform", "translate(" + MARGINS.left + 
                "," + (VIS_HEIGHT + MARGINS.top) + ")") 
          .call(d3.axisBottom(X_SCALE).ticks(8)) 
            .attr("font-size", '10px');

    // adds y axis labels
    FRAME1.append("g") 
          .attr("transform", "translate(" + MARGINS.left + 
                "," + MARGINS.top + ")")
          .call(d3.axisLeft(Y_SCALE).ticks(14)) 
            .attr("font-size", '10px');
	});
}

build_scatter();
