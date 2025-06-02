<script lang="ts">
	import '../app.css';

	import { createPortal } from '$lib/portals';
	import { onDestroy, onMount } from 'svelte';
	import NotificationContainer from '$lib/components/Notification/NotificationContainer.svelte';

	let { children, ...resto } = $props();

	onMount(() => {
		if (typeof document !== 'undefined') {
			// Register the portal host
			const portalHost = document.getElementById('portal-host');
			if (portalHost) {
				createPortal(portalHost);
			}
		}
		if (resto.data.usuario) {
			console.log(resto.data.usuario);
		}
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			// Clean up the portal host
			const portalHost = document.getElementById('portal-host');
			if (portalHost) {
				portalHost.innerHTML = '';
			}
		}
	});
</script>

<div class="main-container">
	<div id="portal-host"></div>
	<NotificationContainer />
	
	{@render children()}
</div>

<style>
	.main-container {
		margin-top: 3.5rem;
	}
	#portal-host {
		position: absolute;
		z-index: 101; /* Ensure it appears above other elements */
	}
</style>
