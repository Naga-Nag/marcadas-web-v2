<script lang="ts">
	import { notifications } from '$lib/components/Notification/notifications';
	import Notification from '$lib/components/Notification/Notification.svelte';
	import type { Notification as NotificationItem } from '$lib/types/gen';

	let notificationList: NotificationItem[] = [];
	notifications.subscribe((list) => (notificationList = list));
</script>

<div id="notification-portal">
	<div class="notification-container">
		{#each notificationList as notification (notification.id)}
			<Notification
				id={notification.id ?? 0}
				title={notification.title}
				message={notification.message}
				duration={notification.duration}
				type={notification.type}
			/>
		{/each}
	</div>
</div>

<style>
	.notification-container {
		position: fixed;
		top: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 10px;
		z-index: 102;
		margin-top: 3rem;
	}
</style>
