// @TODO: YOUR CODE HERE!

// set svg dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// svg wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// svg group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "income";
var chosenYAxis = "obese"

// update x_scale
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// update x_axis
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

//   update circles with transition
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr('transform', d => {
          d.x = newXScale(d[chosenXAxis])
          return `translate(${d.x}, ${d.y})`
      });
  
    return circlesGroup;
  }

// update circles/tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "income") {
      label = "Income:";
    }
    else if (chosenXAxis === 'age') {
      label = "Age:";
    }
    else if (chosenXAxis === 'smokes') {
        label= 'Smokers (%)'
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`Obesity: ${d.obesity}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

d3.csv('assets/data/data.csv').then(function(censusData, err){
    if (err) throw err;

    // assign data to variables
    censusData.forEach(function(data){
        data.state_abbr=data.abbr
        data.age= +data.age
        data.income= +data.income
        data.obesity= +data.obesity
        data.smokes= +data.smokes
    })

    // xlinearScale
    var xLinearScale= xScale(censusData, chosenXAxis);

    // y scale
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.obesity)])
        .range([height, 0]);

    // initialize axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

      // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup= chartGroup.append('g')
        .attr('class','nodes')
        .selectAll('circle')
        .data(censusData)
        .enter()
        .append('g')
        .attr('transform', d => {
            d.x=xLinearScale(d[chosenXAxis]),
            d.y=yLinearScale(d.obesity);
            return `translate(${d.x}, ${d.y})`;
        })
    
    circlesGroup.append('circle')
        .attr('class', 'node')
        .attr('r', '10')
        .attr('fill', '#4b97c9')
        .attr('stroke-width', '1')
        .attr('stroke', '#4b97c9');

    circlesGroup.append('text')
        .attr('x', 0)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text(d => {return d.abbr})
        .attr('font_family', 'sans-serif')
        .attr('font-size', '11px')
        .attr('fill', 'white');
        

    // axis label group
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Income");
    
    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age");

    var smokesLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokers (%)");

    var ylabelgroup=chartGroup.append("g")
                        .attr("transform", "rotate(-90)")
    
    var obesityLabel = ylabelgroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("active", true)
        .text("Percent Obese");
        
    // var smokingLabel = ylabelgroup.append("text")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", 0 - (height / 2))
    //     .attr("dy", "1em")
    //     .classed("active", true)
    //     .text("Smokes"); 

    // chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", 0 - (height / 2))
    //     .attr("dy", "1em")
    //     .classed("axis-text", true)
    //     .text("Percent Obese");

    // update tooltip
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;


        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed('active', false)
            .classed('inactive', true)
        }
        else if (chosenXAxis === 'age'){
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed('active', true)
              .classed('inactive', true);
          }
        else if (chosenXAxis === 'smokes'){
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed('active', true)
            .classed('inactive', false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);

});