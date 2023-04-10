// Constants for the frame dimensions
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500; 
const MARGINS = {left: 67, right: 67, top: 50, bottom: 50};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 

//This creates an svg for the 1st visual
const FRAME1 = d3.select("#left-vis") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame"); 

// This function creates the graph with the various points on the graph through the
// imported csv
function build_scatter() {

  // Loads the csv file
  d3.csv("data.csv").then((data) => {

  data.slice(0, 10).forEach(function(d) {
    for (const prop in d) {
      console.log(`${prop}: ${d[prop]}`);
    }
    console.log('---'); // optional separator for each line
  });

  // Prints a console log statement of the chosen stat line filter after button is clicked
  let column = document.getElementById("xAxisStat").value;
  console.log(column)
    
  // Converts the value associated with the provided key to a float
  const getValue = (d, key) => parseFloat(d[key]);

  // Finds the maximum value associated with a particular column in the dataset
  const getMaxValue = (data, columnName) => {
      return d3.max(data, d => getValue(d, columnName));
  };

  // Finds the minimum value associated with a particular column in the dataset
  const getMinValue = (data, columnName) => {
    return d3.min(data, d => getValue(d, columnName));
  };

  // Finds the average value associated with a particular column in the dataset
  const getAvgValue = (data, columnName) => {
    return d3.mean(data, d => getValue(d, columnName));
  };

  // Finds the average value associated with a particular column and position in the dataset
  const getAvgPosValue = (data, columnName) => {
    return d3.mean(data, d => getValue(d, columnName));
  };

  // The min, max and average are stored in these variables
  const MAX_X = getMaxValue(data, column);
  const MIN_X = getMinValue(data, column);
  const AVG_X = getAvgValue(data, column);

  // Use the function to get the value of a specified column for a given data object
  const getColumnValue = (d, columnName) => getValue(d, column);

  // Use the function to set the 'cx' attribute of a circle based on a specified column
  const setCircleCx = (d, columnName) => {
    return X_SCALE(getColumnValue(d, column)) + MARGINS.left;
  };

  // Define scale functions that maps our data values (domain) to pixel values (range)
  const X_SCALE = d3.scaleLinear() 
                    .domain([MIN_X, MAX_X + AVG_X]) //the x-axis range
                    .range([0, VIS_WIDTH]);

  // Find the maximum value of the "EFF" column in the dataset               
  const MAX_Y = d3.max(data, (d) => {
    return parseFloat(d.EFF)})

  // Find the minimum value of the "EFF" column in the dataset 
  const MIN_Y = d3.min(data, (d) => {
    return parseFloat(d.EFF)})

  // Find the average value of the "EFF" column in the dataset 
  const AVG_Y = d3.mean(data, (d) => {
    return parseFloat(d.EFF)})

  // Define scale functions that maps our data values (domain) to pixel values (range)
  const Y_SCALE = d3.scaleLinear()
                    .domain([MIN_Y, MAX_Y + AVG_Y]) // the y-axis range
                    .range([VIS_HEIGHT,0]);

  // Creates the tooltip for the visual so when you hover over the dot, the values pop up
  const TOOLTIP = d3.select("#left-vis")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

  // When the mouse is over the dot, it shows the player name and the stats of the player
  function mouseOver(event, d) {
    TOOLTIP.style("opacity", 0.9);
    TOOLTIP.html(`${d.Player}<br>${column}: ${getColumnValue(d, column)}<br>EFF: ${d.EFF}`)
            .style("left", (event.pageX + 30) + "px")
            .style("top", (event.pageY - 5) + "px");
  }

  // When the mouse is off the dot, it stops showing the stats of the player
  function mouseOut() {
      TOOLTIP.style("opacity", 0)
              .style("left", (event.pageX + 30) + "px")
              .style("top", (event.pageY - 1000) + "px");
  }
 
  // Each position is a different color
  const colorScale = d3.scaleOrdinal()
      .domain(['PG', 'SG', 'SF', 'PF', 'C'])
      .range(['blue', 'red', 'orange', 'green', 'purple']);

  // Makes a bar graph, when you click a point; the average and selected player's
  // stats show up
  function onClick(event, d) {

    // Removes an existing graph if there is one already selected
    d3.select("#right-vis").select("svg").remove();

    // Create a new svg element for the player graph
    const playerGraph = d3.select("#right-vis")
                          .append("svg")
                          .attr("height", FRAME_HEIGHT)
                          .attr("width", FRAME_WIDTH)
                          .attr("class", "frame");

    // Gets the first name of the selected player
    const first = d.Player.split(' ')[0]
    const last = d.Player.split(' ')[1]
    const position = d.Position

    // Filters the data given teh selected position and gets averages of selected attribute 
    const filtered = data.filter(d => d.Position === position);
    const AVG_POS_X = getAvgPosValue(filtered, column);

    // Gets the average efficiency of the respective position based on the player clicked
    const AVG_POS_EFF = getAvgPosValue(filtered, "EFF");
    
    // Gets the average efficiency of entire league
    const AVG_EFF = getAvgValue(data, "EFF");
      
    // Data for the player's stat and the average stat by position and total NBA average
    const playerData = [
      {"category": first + " " + last, "value": getColumnValue(d, column).toFixed(2), "efficiency": d.EFF},
      {"category": position + " " + "Avg", "value": AVG_POS_X.toFixed(2), "efficiency": AVG_POS_EFF.toFixed(2)},
      {"category": "NBA Avg", "value": AVG_X.toFixed(2), "efficiency": AVG_EFF.toFixed(2)}
    ];

    // Create a y-axis scale for the bar chart
    const yScale = d3.scaleBand()
                     .domain(playerData.map(d => d.category))
                     .range([0, VIS_HEIGHT])
                     .paddingInner(0.65);

    // Create an x-axis scale for the bar chart
    const xScale = d3.scaleLinear() 
                      .domain([MIN_X, MAX_X])
                      .range([0, VIS_WIDTH - 5]);

    // Create the y-axis for the bar chart
    const yAxis = d3.axisLeft(yScale);

    // Adds x axis labels spacing 
    playerGraph.append("g") 
          .attr("transform", "translate(" + MARGINS.left + 
                "," + (VIS_HEIGHT + MARGINS.top) + ")") 
          .call(d3.axisBottom(xScale).ticks(8)) 
          .attr("font-size", '10px');

    // adds y axis labels spacing 
    playerGraph.append("g") 
          .attr("transform", "translate(" + MARGINS.left + 
                "," + MARGINS.top + ")")
          .call(d3.axisLeft(yScale).ticks(14)) 
          .attr("font-size", '10px');

    // Add the y-axis to the player graph
    playerGraph.append("g")
               .attr("class", "y-axis")
               .attr("transform", `translate(${MARGINS.left}, ${MARGINS.top})`);

    // When the mouse is over the line in the bar graph, it shows the player name and 
    // the stats of the player
    function mouseOver2(event, d) {
      TOOLTIP.style("opacity", 0.9);
      TOOLTIP.html(`${d.category}<br>${column}: ${d.value}<br>EFF: ${d.efficiency}`)
              .style("left", (event.pageX + 30) + "px")
              .style("top", (event.pageY - 5) + "px");
    }

    // This adds a border feature so when a point is clicked, a black border is added
    d3.selectAll("circle").style("stroke", null);
    d3.select(this).style("stroke", "black")
                    .style("stroke-width", 3);

    // Create the bars for the player data and average data
    playerGraph.selectAll(".player-bar")
               .data(playerData)
               .enter()
               .append("rect")
               .attr("class", "player-bar")
               .attr("x", MARGINS.left)
               .attr("y", d => yScale(d.category) + MARGINS.top)
               .attr("width", d => xScale(d.value))
               .attr("height", yScale.bandwidth())
               .attr("fill", "blue")
               .attr("opacity", 0.5)
               .on("mouseover", mouseOver2)
               .on("mouseout", mouseOut);

    // Sets the label of the stat value next to the bar line
    playerGraph.selectAll(".player-bar-label")
                 .data(playerData)
                 .enter()
                 .append("text")
                 .attr("class", "player-bar-label")
                 .attr("x", d => MARGINS.left + xScale(d.value) + 5)
                 .attr("y", d => yScale(d.category) + MARGINS.top + yScale.bandwidth()/2 + 5)
                 .text(d => d.value);

    // Adding the y-axis label that compares the player stat against the average for that stat
    playerGraph.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -(FRAME_HEIGHT/2))
                .attr("y", 15)
                .style("text-anchor", "middle")
                .text("Average vs. Chosen Player");

    // Adding the x-axis label based on the chosen stat
    playerGraph.append("text")
                .attr("transform", "translate(" + (FRAME_WIDTH/2) + " ," + (FRAME_HEIGHT) + ")")
                .style("text-anchor", "middle")
                .text(column);
  };

  // Plots the player points based on the chosen stat with 50% opacity and 
  // colors accordingly to position type
  const circles = FRAME1.selectAll("points")  
      .data(data.filter(d => !isNaN(getValue(d, column)) && !isNaN(parseFloat(d.EFF))))
      .enter()       
      .append("circle")  
        .attr("cx", (d) => setCircleCx(d, 'ORB'))
        .attr("cy", (d) => { return (Y_SCALE(d.EFF) + MARGINS.top); }) 
        .attr("r", 4)
        .attr("class", "point")
        .attr("opacity", "50%")
        .attr("fill", (d) => colorScale(d.Position))
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .on("click", onClick);

  // Adds x axis labels spacing 
  FRAME1.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
              "," + (VIS_HEIGHT + MARGINS.top) + ")") 
        .call(d3.axisBottom(X_SCALE).ticks(10)) 
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
        .attr("display", position_display)
        .attr("class", "point");

    selectAxis();

  });

  // Dictionary for legend     
  const positionColor = [
    {"pos": "PG", "color": "blue"},
    {"pos": "SG", "color": "red"},
    {"pos": "SF", "color": "orange"},
    {"pos": "PF", "color": "green"},
    {"pos": "C", "color": "purple"}
  ];
  
  // Appends legened to Frame 1
  const legend = FRAME1.append("g")
    .attr("transform", `translate(${MARGINS.left},${MARGINS.top})`);

  // Adds colored rectangles to legend 
  legend.selectAll("rect")
    .data(positionColor)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 40)
    .attr("y", VIS_HEIGHT - 430)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => d.color);
  
  // Adds position to respective rectangles to legend 
  legend.selectAll("text")
    .data(positionColor)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 42.5)
    .attr("y", VIS_HEIGHT - 430)
    .text(d => d.pos)
    .attr("text-anchor", "middle");
});

  // Adding the x-axis label based on the chosen stat
  let column = document.getElementById("xAxisStat").value;
  FRAME1.append("text")
    .attr("transform", "translate(" + (FRAME_WIDTH/2) + " ," + (FRAME_HEIGHT) + ")")
    .style("text-anchor", "middle")
    .text(column);

  // Adding the y-axis label that says player efficiency
  FRAME1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(FRAME_HEIGHT/2))
    .attr("y", 15)
    .style("text-anchor", "middle")
    .text("Player Efficiency");
}

// Builds the entire scatter plot
build_scatter();

// This clears the frame of previous points when the user selects a new stat
function clearFrame() {
  FRAME1.selectAll("*").remove();
  const pg_checkbox = d3.select('#PG').node();
  pg_checkbox.checked = true;
  const sg_checkbox = d3.select('#SG').node();
  sg_checkbox.checked = true;
  const sf_checkbox = d3.select('#SF').node();
  sf_checkbox.checked = true;
  const pf_checkbox = d3.select('#PF').node();
  pf_checkbox.checked = true;
  const c_checkbox = d3.select('#C').node();
  c_checkbox.checked = true;
  build_scatter();
}

// When the new stat is chosen, prior points are removed
document.getElementById("selectStat")
    .addEventListener('click', clearFrame);