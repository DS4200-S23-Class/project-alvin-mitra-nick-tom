const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500; 
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 

const FRAME1 = d3.select("#left-vis") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame"); 



function build_scatter() {
  // Load csv
  d3.csv("data.csv").then((data) => {

    let column = document.getElementById("xAxisStat").value;
    console.log(column)
    
    const getValue = (d, key) => parseInt(d[key]);

    const getMaxValue = (data, columnName) => {
      return d3.max(data, d => getValue(d, columnName));
    };

    const getMinValue = (data, columnName) => {
      return d3.min(data, d => getValue(d, columnName));
    };

    const getAvgValue = (data, columnName) => {
      return d3.mean(data, d => getValue(d, columnName));
    };



	const MAX_X = getMaxValue(data, column);

  const MIN_X = getMinValue(data, column);

  const AVG_X = getAvgValue(data, column);



    // Use the function to get the value of a specified column for a given data object
  const getColumnValue = (d, columnName) => getValue(d, column);

  // Use the function to set the 'cx' attribute of a circle based on a specified column
  const setCircleCx = (d, columnName) => {
    return X_SCALE(getColumnValue(d, column)) + MARGINS.left;
  };

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
          .attr("cx", (d) => setCircleCx(d, 'ORB'))
          .attr("cy", (d) => { return (Y_SCALE(d.EFF) + MARGINS.top); }) 
          .attr("r", 4)
          .attr("class", "point")
          .attr("opacity", "50%");

    // adds x axis labels spacing 
    FRAME1.append("g") 
          .attr("transform", "translate(" + MARGINS.left + 
                "," + (VIS_HEIGHT + MARGINS.top) + ")") 
          .call(d3.axisBottom(X_SCALE).ticks(8)) 
            .attr("font-size", '10px');

    // adds y axis labels spacing 
    FRAME1.append("g") 
          .attr("transform", "translate(" + MARGINS.left + 
                "," + MARGINS.top + ")")
          .call(d3.axisLeft(Y_SCALE).ticks(14)) 
            .attr("font-size", '10px');

  // Filter plot by selected player position 
  d3.selectAll(".position-button").on("change", function () {
    let selected_position = this.value, 
    position_display = this.checked ? "inline" : "none";

    console.log(position_display);

    FRAME1.selectAll(".point")
        .filter(function(d) { return d.Position == selected_position; })
        .attr("display", position_display);

    selectAxis();

  });

  function selectAxis() {
    column = document.getElementById('xAxisStat')
    console.log(axis)
  }
  

    // // Filter plot by selected statistic to compare against player efficiency
    // d3.selectAll(".selectStat").on("change", function () {
    //   let selected_position = this.value, 
    //   position_display = this.checked ? "inline" : "none";
  
    //   console.log(position_display);
  
    //   FRAME1.selectAll(".point")
    //       .filter(function(d) { return d.value == selected_position; })
    //       .attr("display", position_display);
    // });

    //Filter by the x-axis selection done by the user 
	});

  //adding x-axis label 
  FRAME1.append("text")
   .attr("transform", "translate(" + (FRAME_WIDTH/2) + " ," + (FRAME_HEIGHT) + ")")
   .style("text-anchor", "middle")
   .text("Total Points Scored");

   FRAME1.append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", -(FRAME_HEIGHT/2))
   .attr("y", 15)
   .style("text-anchor", "middle")
   .text("Player Efficiency");

}

build_scatter();

function clearFrame() {
  FRAME1.selectAll("*").remove();
  build_scatter();
}


document.getElementById("selectStat")
    .addEventListener('click', clearFrame);




