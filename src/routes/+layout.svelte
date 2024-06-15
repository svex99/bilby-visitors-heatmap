<script>
	import '../app.css';
	import logo from '$lib/assets/logo.png';
</script>

<div class="flex flex-col items-center justify-between min-h-screen bg-gray-50">
	<nav class="w-full flex py-5 justify-center shadow sticky top-0 left-0 bg-white z-10">
		<div class="px-5 container">
			<img src={logo} alt="logo" class="h-12" />
		</div>
	</nav>

	<main class="px-5 container py-10">
		<slot />
	</main>

	<footer class="w-full flex justify-center py-16 bg-white">
		&copy 2024 Web Traffics Inc. All rights reserved.
	</footer>
</div>
