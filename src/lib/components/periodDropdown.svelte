<script lang="ts">
	export let value: string;

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

<select bind:value on:change>
	{#each options as option}
		<option value={option.value}>Show Me {option.label}</option>
	{/each}
</select>
