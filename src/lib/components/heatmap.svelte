<script lang="ts">
	import * as d3 from 'd3';

	export let data: {
		key: string;
		hours: {
			key: number;
			unique: number;
		}[];
	}[];
	export let width = 1200;
	export let height = 1000;
	export let margin = {
		left: 30,
		right: 30,
		top: 30,
		bottom: 30
	};

	$: dataPoints = data
		.map((country) =>
			country.hours.map((hour) => ({
				country: country.key,
				hour: hour.key,
				value: hour.unique
			}))
		)
		.flat();

	// Values for the X axis. The hours of the day (1h - 24h).
	$: x = d3
		.scalePoint()
		.range([0, width])
		.domain(Array.from({ length: 24 }).map((_, i) => `${i + 1}`))
		.padding(0.5);

	// Values for the Y axis. The countries' keys (CN, US, etc.).
	$: y = d3
		.scalePoint()
		.range([0, height])
		.domain(data.map((country) => country.key))
		.padding(0.5);

    // Scale of colors to display intensity of values in the heatmap.
    // The scale goes from 0 to the maximum value of the data points.
	$: color = d3
		.scaleSequential(d3.interpolateReds)
		.domain([0, d3.max(dataPoints, (d) => d.value) ?? 0]);

	let svgEl: SVGElement;

	$: {
		const svg = d3
			.select(svgEl)
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Plot the X and Y axises.
		const xAxis = svg
			.append('g')
			.call(
				d3
					.axisBottom(x)
					// Remove the ticks at the extremes of the axis.
					.tickSizeOuter(0)
					// Set the inner ticks to grow inside the heatmap to create a background grid.
					.tickSizeInner(-height)
					// Format the ticks to show the hours of the day.
					.tickFormat((v) => (v === '12' ? v : v === '1' || v === '24' ? `${v}hr` : ''))
			)
			.attr('transform', `translate(0,${height})`);

		const yAxis = svg.append('g').call(
			d3
				.axisLeft(y)
				// Remove the ticks at the extremes of the axis.
				.tickSizeOuter(0)
				// Set the inner ticks to grow inside the heatmap to create a background grid.
				.tickSizeInner(-width + 1)
		);

		// Set a light gray color to ticks in the background of the heatmap and make some adjustments.
		xAxis.selectAll('line').attr('color', '#F0EFEF');
		yAxis
			.selectAll('line')
			.attr('color', '#F0EFEF')
			// Translate 1px the ticks to the right to avoid a small overlapping with left axis.
			.attr('transform', 'translate(1, 0)');

		// Set a gray color to the text of the ticks and add some margin from the axis.
		xAxis.selectAll('text').attr('color', 'gray').attr('dy', '1rem');
		yAxis.selectAll('text').attr('color', 'gray');

		svg
			.append('g')
			.selectAll()
			.data(dataPoints)
			.enter()
			.append('circle')
			.attr('cx', (d) => x(`${d.hour + 1}`) ?? 0)
			.attr('cy', (d) => y(d.country) ?? 0)
			.attr('r', 15)
			.attr('fill', (d) => color(d.value));
	}
</script>

<div class="space-y-3">
	<h3 class="text-xl font-medium leading-relaxed">Unique Destinations Heatmap</h3>
	<!-- Using #key here destroys the whole svg element when the data points change. -->
	<!-- This is almost required, because we need to remove from the svg all the elements from the previous heatmap displayed. -->
	<!-- If the elements are not removed a new heatmap will be drawn over the previous one. -->
	<!-- The only element that is not subject to change is the X-axis, but countries (Y-axis) could change its order. -->
	<!-- Due that we should recreate almost the whole svg, it's preferable to use #key than to use a granular and bug-prone approach. -->
	{#key dataPoints}
		<svg bind:this={svgEl} {width} {height}></svg>
	{/key}
</div>
