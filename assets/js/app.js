// width and height for the svg
const svgWidth =1000;
const svgHeight =700;

let margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an svg that will hold the chart
let svg = d3
	.select('#scatter')
    .classed('chart',true)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height',svgHeight);

// group SVG elements (shapes) together so they can be manipulated by left and top margins
let chartGroup = svg
	.append('g')
    .attr('transform',`translate(${margin.left}, ${margin.top})`);

// View selection - changing this triggers transition
var currentSelectionX = 'poverty',
	currentSelectionY = 'healthcare';

// Returns a updated scale based on the current selection for X-axis.
function xScale(data,currentSelectionX) {
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => parseInt(d[currentSelectionX]) *.9), 
				d3.max(data, d => parseInt(d[currentSelectionX]) *1.1)
			])
		.range([0, width])
	
	return xLinearScale
};

// Returns a updated scale based on the current selection for y-axis.
function yScale(data,currentSelectionY) {
	var yLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => parseInt(d[currentSelectionY]) *.9), 
				d3.max(data, d => parseInt(d[currentSelectionY]) *1.1)
			])
		.range([height, 0])

	return yLinearScale
};

// Returns an updated x-axis based on x scale.
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale)
  
    xAxis
      .transition()
	  .duration(1000)
	  .ease(d3.easeBack)
      .call(bottomAxis)
  
    return xAxis
  };

// Returns an updated y-axis based on y scale.
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale)
  
    yAxis
      .transition()
	  .duration(1000)
	  .ease(d3.easeBack)
      .call(leftAxis)
  
    return yAxis

  };
  
  
// Returns and appends an updated circles group based on a new scale and the currect selection.  
function renderCircles(circlesGroup, newXScale, newYScale, currentSelectionX, currentSelectionY) {

    circlesGroup
      .transition()
	  .duration(1000)
	  .ease(d3.easeBack)
      .attr("cx", d => newXScale(d[currentSelectionX]))
      .attr("cy", d => newYScale(d[currentSelectionY]))
          
    return circlesGroup
  };

// Returns and appends an updated state abbr text group based on a new scale and the currect selection.   
function renderText(textGroup, newXScale, newYScale, currentSelectionX, currentSelectionY) {
   
	textGroup
    .transition()
	.duration(1000)
	.ease(d3.easeBack)
    .attr("x", d => newXScale(d[currentSelectionX]))
	.attr("y", d => newYScale(d[currentSelectionY]))
	
    return textGroup   
  };

// adding and updating tooltip to show more detail when you hover - NOT WORKING
function updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup) {
	var toolTip = d3.tip()
		.attr('class','d3-tip')
		.offset([80, -60])
		.html( d => {
			if(currentSelectionX === "poverty")
				return (`${d.state}<br>${currentSelectionY}:${d[currentSelectionY]}% 
						<br>${currentSelectionX}:${d[currentSelectionX]}%`)
			else if (currentSelectionX === 'income')
				return (`${d.state}<br>${currentSelectionY}:${d[currentSelectionY]}% 
						<br>${currentSelectionX}:$${d[currentSelectionX]}`)
			else
				return (`${d.state}<br>${currentSelectionY}:${d[currentSelectionY]}% 
						<br>${currentSelectionX}:${d[currentSelectionX]}`)
			});

	circlesGroup.call(toolTip);
	circlesGroup.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

	d3.selectAll('.stateText').call(toolTip);
	d3.selectAll('.stateText').on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

	return circlesGroup;
	return textGroup;
};

//=================================================================
//                         Create chart
//=================================================================


	
d3.csv("assets/data/data.csv").then(data =>{
	data.forEach( d =>{
		d.poverty = +d.poverty;
		d.age = +d.age;
		d.income = +d.income;
		d.obesity = +d.obesity;
		d.smokes = +d.smokes;
		d.healthcare = +d.healthcare;
	});


	// creating x and y scales
	var xLinearScale = xScale(data,currentSelectionX),
		yLinearScale = yScale(data,currentSelectionY);

	// creating x and y axis
	var bottomAxis = d3.axisBottom(xLinearScale),
		leftAxis = d3.axisLeft(yLinearScale);

	// chartgroup - appending x axis
	var xAxis = chartGroup
		.append('g')
		.classed("x-axis", true)
		.attr('transform',`translate(0, ${height})`)
		.call(bottomAxis);
	
	// chartgroup - appending y axis
	var yAxis = chartGroup.append('g')
		.call(leftAxis);

	// text on x and y axis //
	chartGroup.append("text")
		.attr("transform", `translate(${width - 40},${height - 5})`)
		.attr("class", "axis-text-main")
		.text("Demographics")
	chartGroup.append("text")
		.attr("transform", `translate(15,60 )rotate(270)`)
		.attr("class", "axis-text-main")
		.text("Behavioral Risk Factors")
	
	
	// adding circles for the default chart
	var circlesGroup = chartGroup.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.classed('stateCircle',true)
		.attr('cx', d => xLinearScale(d[currentSelectionX]))
		.attr('cy', d => yLinearScale(d[currentSelectionY]))
		.attr('r' , 10)
	
	// adding state abbreviation text
	var textGroup = chartGroup.append('g').selectAll('text')
		.data(data)
		.enter()
		.append('text')
		.classed('stateText',true)
		.attr('x', d => xLinearScale(d[currentSelectionX]))
		.attr('y', d => yLinearScale(d[currentSelectionY]))
		.attr('transform','translate(0,4.5)')
		.text(d => d.abbr)


	//--- Label group for X-axis ---//
	var xLabelsGroup = chartGroup
		.append('g')
		.attr('transform', `translate(${width / 2}, ${height + 20})`);
	
	// Poverty (x-axis)
	var povertyLabel = xLabelsGroup
		.append('text')
		.attr('x', 0)
		.attr('y', 20)
		.attr('value', 'poverty')
		.classed('aText active', true)
		.text('In Poverty (%)');
	
	// Age (x-axis)
	var ageLabel = xLabelsGroup
		.append('text')
		.attr('x', 0)
		.attr('y', 40)
		.attr('value', 'age')
		.classed('aText inactive', true)
		.text('Age (Median)');
	
	// Income (x-axis)
	var incomeLabel = xLabelsGroup
		.append('text')
		.attr('x', 0)
		.attr('y', 60)
		.attr('value', 'income')
		.classed('aText inactive', true)
		.text('Household Income (Median)');

	//--- Label group for Y-axis ---//
	var yLabelsGroup = chartGroup.append('g')


	// HealthCare (y axis)
	var HealthLabel = yLabelsGroup
		.append('text')
		.attr("transform", `translate(-40,${height / 2})rotate(-90)`)
		.attr('value', 'healthcare')
		.classed('aText active', true)
		.text('Lacks Healthcare (%)');

	// Smoking (y axis)
	var smokesLabel = yLabelsGroup
		.append('text')
		.attr("transform", `translate(-60,${height / 2})rotate(-90)`)
		.attr('value', 'smokes')
		.classed('aText inactive', true)
		.text('Smokes (%)');

	// Obesity (y axis)
	var obesityLabel = yLabelsGroup
		.append('text')
		.attr("transform", `translate(-80,${height / 2})rotate(-90)`)
		.attr('value', 'obesity')
		.classed('aText inactive', true)
		.text('Obese (%)');

	// Update Tooltip for Circle and Text
	var circlesGroup = updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup),
		textGroup = updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup);

	// Create an event listener to call the update functions when a label on X-axis is clicked
	xLabelsGroup.selectAll('text')
		.on('click', function() {
			var value = d3.select(this).attr('value');
			if (value !== currentSelectionX) {
				currentSelectionX = value

				xLinearScale = xScale(data, currentSelectionX)

				//xAxis = renderXAxis(xLinearScale, xAxis)
				xAxis.transition()
				    .duration(1000)
				    .ease(d3.easeBack)
					.call(d3.axisBottom(xLinearScale));
				
				/* circlesGroup = renderCircles(
					circlesGroup,
					xLinearScale,
					yLinearScale,
					currentSelectionX,
					currentSelectionY
				); */

				circlesGroup.transition()
			        .duration(1000)
			        .ease(d3.easeBack)
			        .on('start',function(){
			        	d3.select(this)
			        		.attr("opacity", 0.50)
			        		.attr('r',15);
			        })
			        .on('end',function(){
			        	d3.select(this)
			        		.attr("opacity", 1)
			        		.attr('r',10)
			        })
			        .attr('cx', d => xLinearScale(d[currentSelectionX]));

			    d3.selectAll('.stateText').transition()
			    	.duration(1000)
			    	.ease(d3.easeBack)
			    	.attr('x', d => xLinearScale(d[currentSelectionX]));

				//textGroup = renderText(textGroup, xLinearScale, yLinearScale,  currentSelectionX, currentSelectionY);

				circlesGroup = updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup),
				textGroup = updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup);

				if (currentSelectionX === 'poverty') {
					povertyLabel
						.classed('active', true)
						.classed('inactive', false);
					incomeLabel
						.classed('active', false)
						.classed('inactive', true);
					ageLabel
						.classed('active', false)
						.classed('inactive', true);
				}
				else if (currentSelectionX === 'age'){
					povertyLabel
						.classed('active', false)
						.classed('inactive', true);
					incomeLabel
						.classed('active', false)
						.classed('inactive', true);
					ageLabel
						.classed('active', true)
						.classed('inactive', false);
				}
				else {
					povertyLabel
						.classed('active', false)
						.classed('inactive', true);
					incomeLabel
						.classed('active', true)
						.classed('inactive', false);
					ageLabel
						.classed('active', false)
						.classed('inactive', true);
				}
			}
		});

	// Create an event listener to call the update functions when a label on Y-axis is clicked
	yLabelsGroup.selectAll('text')
		.on('click', function() {
			var value = d3.select(this).attr('value');
			if (value !== currentSelectionY) {
				currentSelectionY = value

				yLinearScale = yScale(data, currentSelectionY)

				// yAxis = renderYAxis(yLinearScale, yAxis)
				yAxis.transition()
				    .duration(1000)
				    .ease(d3.easeBack)
					.call(d3.axisLeft(yLinearScale));

				/*circlesGroup = renderCircles(
					circlesGroup,
					xLinearScale,
					yLinearScale,
					currentSelectionX,
					currentSelectionY
				);*/

				circlesGroup.transition()
			        .duration(1000)
			        .ease(d3.easeBack)
			        .on('start',function(){
			        	d3.select(this)
			        		.attr("opacity", 0.50)
			        		.attr('r',15);
			        })
			        .on('end',function(){
			        	d3.select(this)
			        		.attr("opacity", 1)
			        		.attr('r',10)
			        })
			        .attr('cy', d => yLinearScale(d[currentSelectionY]));

			    d3.selectAll('.stateText').transition()
			    	.duration(1000)
			    	.ease(d3.easeBack)
			    	.attr('y', d => yLinearScale(d[currentSelectionY]))

				// textGroup = renderText(textGroup, xLinearScale, yLinearScale,  currentSelectionX, currentSelectionY);

				circlesGroup = updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup),
				textGroup = updateToolTip(currentSelectionY,currentSelectionX,circlesGroup,textGroup);

				if (currentSelectionY === 'healthcare') {
					HealthLabel
						.classed('active', true)
						.classed('inactive', false);
					smokesLabel
						.classed('active', false)
						.classed('inactive', true);
					obesityLabel
						.classed('active', false)
						.classed('inactive', true);
				}
				else if (currentSelectionY === 'obesity'){
					HealthLabel
						.classed('active', false)
						.classed('inactive', true);
					smokesLabel
						.classed('active', false)
						.classed('inactive', true);
					obesityLabel
						.classed('active', true)
						.classed('inactive', false);
				}
				else {
					HealthLabel
						.classed('active', false)
						.classed('inactive', true);
					smokesLabel
						.classed('active', true)
						.classed('inactive', false);
					obesityLabel
						.classed('active', false)
						.classed('inactive', true);
				}
			}
		});
	});
