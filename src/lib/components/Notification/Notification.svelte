<script lang="ts">
	import { removeNotification } from '$lib/components/Notification/notifications';
	import { fly } from 'svelte/transition';
	export let id: number;
	export let title: string;
	export let message: string;
	export const duration: number = 3000;
	export let type = 'info';
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="notification {type}"
	on:click={() => removeNotification(id)}
	in:fly={{ y: -50, duration: 300 }}
	out:fly={{y: -50, duration: 500 }}
>
	<h3>{title}</h3>
	<p>{message}</p>
</div>

<style>
	.notification {
		padding: 15px;
		background: rgba(255, 255, 255, 0.6); /* Transparent dark background */
		color: rgb(255, 255, 255); /* White text for contrast */
		border: 1px solid rgba(255, 255, 255, 0.4); /* Light transparent border */
		border-radius: 5px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Slightly darker shadow */
		cursor: pointer;
		min-width: 200px;
		max-width: 300px;
		margin-bottom: 10px;
		font-family: Arial, sans-serif;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: bold;
	}

	p {
		margin: 5px 0 0 0;
		font-size: 14px;
	}

	.success {
		background: rgba(34, 193, 195, 0.8); /* Teal-green background */
		border-color: rgba(34, 193, 195, 0.6);
	}

	.error {
		background: rgba(255, 0, 0, 0.8); /* Red background */
		border-color: rgba(255, 0, 0, 0.6);
	}

	.info {
		background: rgba(0, 123, 255, 0.8); /* Blue background */
		border-color: rgba(0, 123, 255, 0.6);
	}

	.warning {
		background: rgba(255, 165, 0, 0.8); /* Orange background */
		border-color: rgba(255, 165, 0, 0.6);
	}
</style>
