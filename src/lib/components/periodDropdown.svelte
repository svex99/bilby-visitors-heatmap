<script lang="ts">
	export let value: string;

	let className = '';
	export { className as class };

	const options = [
		{
			value: 'last_week',
			label: 'Last Week'
		},
		{
			value: 'last_two_weeks',
			label: 'Last Two Weeks'
		},
		{
			value: 'last_month',
			label: 'Last Month'
		},
		{
			value: 'last_quarter',
			label: 'Last Quarter'
		},
		{
			value: 'last_year',
			label: 'Last Year'
		}
	];
</script>

<select
	bind:value
	on:change
	class="px-5 py-3 rounded-lg text-gray-500 bg-white border shadow-sm {className}"
>
	{#each options as option}
		<option value={option.value}>Show Me {option.label}</option>
	{/each}
</select>
