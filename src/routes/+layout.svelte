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

<div class="app-layout">
	<div id="portal-host"></div>
	<NotificationContainer />
	
	<div class="main-container">
		{@render children()}
	</div>
</div>

<style>
	.app-layout {
		position: relative;
		min-height: 100vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
	}

	.main-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0;
		margin: 0;
		width: 100%;
		max-width: 100vw;
		overflow-x: hidden;
	}
	
	#portal-host {
		position: absolute;
		z-index: 101;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	#portal-host > * {
		pointer-events: auto;
	}

	/* ===== SCROLL BEHAVIOR ===== */
	.main-container {
		scroll-behavior: smooth;
	}

	/* ===== GLOBAL ANIMATIONS ===== */
	.main-container > * {
		animation: fadeInUp 0.5s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
