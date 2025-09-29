<script lang="ts">
	import '../app.css';

	import { createPortal } from '$lib/portals';
	import { onDestroy, onMount } from 'svelte';
	import NotificationContainer from '$lib/components/Notification/NotificationContainer.svelte';
	import { setUsuario } from '$lib/stores/usuario';

	let { children, ...resto } = $props();

	onMount(() => {
		if (typeof document !== 'undefined') {
			// Register the portal host
			const portalHosts = document.getElementsByClassName('portal-host');
			if (portalHosts.length > 0) {
				createPortal(portalHosts[0]);
			}
		}
		if (resto.data.usuario) {
			console.log(resto.data.usuario);
			// Set the user in the client-side store
			setUsuario(resto.data.usuario);
		}
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			// Clean up the portal host
			const portalHosts = document.getElementsByClassName('portal-host');
			for (let i = 0; i < portalHosts.length; i++) {
				portalHosts[i].innerHTML = '';
			}
		}
	});
</script>

<div class="portal-host"></div>
<div class="app-layout">
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

	.portal-host {
		position: absolute;
		z-index: 10;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	/* ===== SCROLL BEHAVIOR ===== */
	.main-container {
		scroll-behavior: smooth;
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
