
const svgWidth =1000;
const svgHeight =700;

let margin = {
    top: 50,
    right: 50,
    bottom: 100,
    left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append an svg that will hold the chart
let svg = d3.select('#scatter')
    .classed('chart',true)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height',svgHeight)

// group SVG elements (shapes) together so they can be manipulated by left and top margins
let chartGroup = svg.append('g')
    .attr('transform',`translate(${margin.left}, ${margin.top})`)

//=================================================================
//                         Create chart
//=================================================================

// View selection - changing this triggers transition
let currentSelectionX = 'poverty',
	currentSelectionY = 'healthcare';

// Returns a updated scale based on the current selection for X-axis.
function getXScaleForAxis(data,currentSelectionX) {
	var xLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => d[currentSelectionX])*.9, 
				d3.max(data, d => d[currentSelectionX])*1.1])
		.range([0, width]);
	
	return xLinearScale;
}

// Returns a updated scale based on the current selection for y-axis.
function getYScaleForAxis(data,currentSelectionY) {
	var yLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => d[currentSelectionY])*.9, 
				d3.max(data, d => d[currentSelectionY])*1.1])
		.range([height, 0]);

	return yLinearScale;
}


d3.csv("data/data.csv").then( data =>{
	data.forEach( d =>{
		d.poverty = +d.poverty;
		d.age = +d.age;
		d.income = +d.income;
		d.obesity = +d.obesity;
		d.smokes = +d.smokes;
		d.healthcare = +d.healthcare;
	});

	var xLinearScale = getXScaleForAxis(data,currentSelectionX),
		yLinearScale = getYScaleForAxis(data,currentSelectionY);

	
	var xAxis = d3.axisBottom(xLinearScale),
		yAxis = d3.axisLeft(yLinearScale);

	var xAxis = chartGroup.append('g')
		.attr('transform',`translate(0,${height})`)
		.call(xAxis);
	var yAxis = chartGroup.append('g')
		.call(yAxis);

	chartGroup.append("text")
		.attr("transform", `translate(${width - 40},${height - 5})`)
		.attr("class", "axis-text-main")
		.text("Demographics")

	chartGroup.append("text")
		.attr("transform", `translate(15,60 )rotate(270)`)
		.attr("class", "axis-text-main")
		.text("Behavioral Risk Factors")


	var stateCircles = chartGroup.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.classed('stateCircle',true)
		.attr('cx', d => xLinearScale(d[currentSelectionX]))
		.attr('cy', d => yLinearScale(d[currentSelectionY]))
		.attr('r' , 10)
	
	var stateText = chartGroup.append('g').selectAll('text')
		.data(data)
		.enter()
		.append('text')
		.classed('stateText',true)
		.attr('x', d => xLinearScale(d[currentSelectionX]))
		.attr('y', d => yLinearScale(d[currentSelectionY]))
		.attr('transform','translate(0,4.5)')
		.text(d => d.abbr)

	var xLabelsGroup = chartGroup.append('g')
		.attr('transform', `translate(${width / 2}, ${height + 20})`);

	var povertyLabel = xLabelsGroup.append('text')
		.attr('x', 0)
		.attr('y', 20)
		.attr('value', 'poverty')
		.classed('aText active', true)
		.text('In Poverty (%)');

	var ageLabel = xLabelsGroup.append('text')
		.attr('x', 0)
		.attr('y', 40)
		.attr('value', 'age')
		.classed('aText inactive', true)
		.text('Age (Median)');

	var incomeLabel = xLabelsGroup.append('text')
		.attr('x', 0)
		.attr('y', 60)
		.attr('value', 'income')
		.classed('aText inactive', true)
		.text('Household Income (Median)');

	var yLabelsGroup = chartGroup.append('g')

	var HealthLabel = yLabelsGroup.append('text')
		.attr("transform", `translate(-40,${height / 2})rotate(-90)`)
		.attr('value', 'healthcare')
		.classed('aText active', true)
		.text('Lacks Healthcare (%)');

	var smokesLabel = yLabelsGroup.append('text')
		.attr("transform", `translate(-60,${height / 2})rotate(-90)`)
		.attr('value', 'smokes')
		.classed('aText inactive', true)
		.text('Smokes (%)');

	var obesityLabel = yLabelsGroup.append('text')
		.attr("transform", `translate(-80,${height / 2})rotate(-90)`)
		.attr('value', 'obesity')
		.classed('aText inactive', true)
		.text('Obese (%)');


	var stateCircles = updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText),
		stateText = updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText);

	// Create an event listener to call the update functions when a label on X-axis is clicked
	xLabelsGroup.selectAll('text')
		.on('click', function() {
			var value = d3.select(this).attr('value');
			if (value !== currentSelectionX) {
				currentSelectionX = value;

				xLinearScale = getXScaleForAxis(data, currentSelectionX);

				xAxis.transition()
					.duration(1000)
					.ease(d3.easeBack)
					.call(d3.axisBottom(xLinearScale));

				stateCircles.transition()
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

				stateCircles = updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText),
				stateText = updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText);

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
				currentSelectionY = value;

				yLinearScale = getYScaleForAxis(data, currentSelectionY);

				yAxis.transition()
					.duration(1000)
					.ease(d3.easeBack)
					.call(d3.axisLeft(yLinearScale));

				stateCircles.transition()
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
					.attr('y', d => yLinearScale(d[currentSelectionY]));

				stateCircles = updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText),
				stateText = updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText);

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
	
// adding and updating tooltip
function updateToolTip(currentSelectionY,currentSelectionX,stateCircles,stateText) {
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

	stateCircles.call(toolTip);
	stateCircles.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

	d3.selectAll('.stateText').call(toolTip);
	d3.selectAll('.stateText').on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

	return stateCircles;
	return stateText;
}