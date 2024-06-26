<script lang="ts">
	import * as d3 from 'd3';
	import HeatmapTooltip from './heatmapTooltip.svelte';

	export let data: {
		key: string;
		hours: {
			buckets: {
				key: number;
				unique: {
					value: number;
				};
			}[];
		};
	}[];

	const margin = {
		left: 30,
		right: 30,
		top: 30,
		bottom: 30
	};

	// Display the heatmap using the full width of the container
	// or assign 35px to each hour of the day.
	let heatMapContainer: HTMLDivElement | undefined;
	$: width = Math.max(heatMapContainer?.clientWidth ?? 0, 24 * 35);
	// Set 35px of height to each country.
	$: height = data.length * 35;

	// Simplify the data structure to a flat array of data points and remove values with 0 visitors.
	// We are removing values with 0 visitors to avoid displaying them in the heatmap differently from missing values.
	$: dataPoints = data
		.map((country) =>
			country.hours.buckets
				.filter((hour) => hour.unique.value !== 0)
				.map((hour) => ({
					country: country.key,
					hour: hour.key,
					value: hour.unique.value
				}))
		)
		.flat();

	// Values for the X axis. The hours of the day (1h - 24h).
	$: x = d3
		.scalePoint()
		.range([0, width - margin.left - margin.right])
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

	// Track the hovered data point data to show the tooltip.
	let tooltipDataPoint: (typeof dataPoints)[0] | null = null;
	// Track the position to place the tooltip.
	let tooltipLeftPos = 0;
	let tooltipTopPos = 0;

	let svgEl: SVGElement;

	$: {
		const svg = d3
			.select(svgEl)
			.attr('width', width - margin.left)
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
				.tickSizeInner(-width + margin.left + margin.right)
		);

		// Set a light gray color to ticks in the background of the heatmap and make some adjustments.
		xAxis.selectAll('line').attr('color', '#F0EFEF');
		yAxis
			.selectAll('line')
			.attr('color', '#F0EFEF')
			// Translate 1px the ticks to the right to avoid a small overlapping with left axis.
			.attr('transform', 'translate(1, 0)');

		// Set a gray color to the text of the ticks and make some adjustments.
		xAxis.selectAll('text').attr('color', 'gray').attr('transform', 'translate(0, 10)');
		yAxis.selectAll('text').attr('color', 'gray').attr('font-size', '0.8rem');

		svg
			.append('g')
			.selectAll()
			.data(dataPoints)
			.enter()
			.append('circle')
			.attr('cx', (dataPoint) => x(`${dataPoint.hour + 1}`) ?? 0)
			.attr('cy', (dataPoint) => y(dataPoint.country) ?? 0)
			.attr('r', 15)
			.attr('fill', (d) => color(d.value))
			.attr('tabindex', '0')
			// Show tooltip on desktop when the mouse enters a cell.
			.on('mouseenter', setTooltip)
			// Hide tooltip on desktop when the mouse leaves a cell.
			.on('mouseleave', () => {
				tooltipDataPoint = null;
			})
			// Show tooltip on mobile when the cell is clicked.
			.on('click', setTooltip)
			// Show tooltip when the cell is focused for keyboard navigation.
			.on('focus', setTooltip)
			// Hide the tooltip on Escape key.
			.on('keydown', (event) => {
				if (event.key === 'Escape') {
					tooltipDataPoint = null;
				}
			});
	}

	function setTooltip(event: any, dataPoint: (typeof dataPoints)[0]) {
		tooltipDataPoint = dataPoint;
		const rect = event.srcElement.getBoundingClientRect();
		tooltipLeftPos = document.documentElement.scrollLeft + rect.left;
		tooltipTopPos = document.documentElement.scrollTop + rect.top;
	}
</script>

<div>
	<h3 class="text-xl font-medium leading-relaxed">Unique Destination Heatmap</h3>
	<!-- Using #key here destroys the whole svg element when the data points change. -->
	<!-- This is almost required, because we need to remove from the svg all the elements from the previous heatmap displayed. -->
	<!-- If the elements are not removed a new heatmap will be drawn over the previous one. -->
	<!-- The only element that is not subject to change is the X-axis, but countries (Y-axis) could change its order. -->
	<!-- Due that we should recreate almost the whole svg, it's preferable to use #key than to use a granular and bug-prone approach. -->
	<div class="overflow-x-auto w-full" bind:this={heatMapContainer}>
		{#key dataPoints || width || height}
			<!-- Ignore a11y issues since basically we want to handle bubbling clicks from cells in the SVG,
			tose cells are already interactive and have the proper semantics. -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<svg
				bind:this={svgEl}
				role="img"
				on:click={(event) => {
					// Hide the tooltip when clicking outside a cell.
					if (event.target?.nodeName !== 'circle') {
						tooltipDataPoint = null;
					}
				}}
			>
			</svg>
		{/key}
	</div>
</div>

{#if tooltipDataPoint}
	<HeatmapTooltip data={tooltipDataPoint} leftPos={tooltipLeftPos} topPos={tooltipTopPos} />
{/if}
