<script lang="ts">
	import { fade } from 'svelte/transition';

	export let data: {
		country: string;
		hour: number;
		value: number;
	};
	export let leftPos: number;
	export let topPos: number;
</script>

<div
	class="absolute text-center font-bold bg-black/80 text-gray-200 rounded-lg shadow-md p-5"
	style="left: {leftPos + 15}px; top: {topPos + 15}px"
	transition:fade={{ duration: 100 }}
>
	<p class="text-3xl">{data.value} <span class="text-sm">visitor(s)</span></p>
	<p class="text-sm">from {data.country} at {data.hour}hr</p>
</div>
