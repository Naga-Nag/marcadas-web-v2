import { writable } from 'svelte/store';
import type { Notification } from '$lib/types/gen';

export const notifications = writable<Notification[]>([]);

/**
 * Add a notification to the store
 * @param {Notification} notification The notification object
 * @param {number} [notification.duration=3000] The duration of the notification
 * @param {string} [notification.type] The type of notification
 */
export function notify({ title, message, duration = 3000, type }: Notification) {
    const id = Date.now(); // Generate a unique ID automatically
    notifications.update((current) => [...current, { id, title, message, duration, type }]);

    // Timeout para la notificacion
    setTimeout(() => {
        removeNotification(id);
    }, duration);
}

/**
 * Remove a notification by ID
 * @param {number} id The ID of the notification to remove
 */
export function removeNotification(id: number) {
    notifications.update((current) => current.filter((notification) => notification.id !== id));
}

/**
 * Get all notifications
 * @returns {Notification[]} The notifications array
 */
export function getNotifications() {
    return notifications;
}
