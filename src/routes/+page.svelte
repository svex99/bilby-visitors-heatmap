<script lang="ts">
	import PeriodDropdown from '$lib/components/periodDropdown.svelte';
	import Heatmap from '$lib/components/heatmap.svelte';
	import { trpcServer } from '$lib/trpc';
	import type { GetVisitorsByCountryParams } from '$server/validations/getVisitorsByCountry.schema';
	import { TRPCClientError } from '@trpc/client';

	export let data;

	// Load the initial data for the page from the load function in the route.
	let visitors = data.visitorsByCountry;

	let period: GetVisitorsByCountryParams['period'] = 'last_week';
	let loading = false;
	let errors: { message: string }[] = [];

	async function fetchVisitors() {
		loading = true;

		try {
			visitors = await trpcServer(fetch).visitors.getVisitorsByCountry.query({ period });
		} catch (err) {
			if (err instanceof TRPCClientError) {
				errors = JSON.parse(err.message);
			} else {
				throw err;
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Home - Web Traffics</title>
</svelte:head>

<div class="space-y-5">
	<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
		<h1 class="text-4xl font-medium leading-relaxed items-center">Web Traffics</h1>

		<PeriodDropdown {loading} bind:value={period} on:change={fetchVisitors} class="self-end sm:self-auto" />
	</div>

	<div class="border rounded-lg bg-white p-5 shadow-sm">
		{#if errors.length}
			<div class="text-red-500">
				{#each errors as error}
					<p>{error.message}</p>
				{/each}
			</div>
		{:else}
			<Heatmap data={visitors} />
		{/if}
	</div>
</div>
