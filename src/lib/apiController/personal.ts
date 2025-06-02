import { notify } from '$lib/components/Notification/notifications';
import { API_BASE_URL } from './api';
import type { Personal } from '$lib/types/gen';

// Obtener todo el personal
export async function fetchPersonal(): Promise<Personal[]> {
    const res = await fetch(`${API_BASE_URL}/personal`);
    if (!res.ok) throw new Error('Error al obtener personal');
    return await res.json();
}

// Obtener personal por ID
export async function fetchPersonalById(id: string): Promise<Personal> {
    const res = await fetch(`${API_BASE_URL}/personal?id=${id}`);
    if (!res.ok) throw new Error('Error al obtener personal');
    return await res.json();
}

// Crear nuevo personal
export async function createPersonal(personal: Personal): Promise<Personal> {
    const res = await fetch(`${API_BASE_URL}/personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personal)
    });
    if (!res.ok) throw new Error('Error al crear personal');
    notify({
        title: 'Personal creado',
        message: `Se ha creado el personal ${personal.Nombre} correctamente.`,
        duration: 3000,
        type: 'success'
    });
    return await res.json();
}

// Actualizar personal
export async function updatePersonal(personal: Partial<Personal>): Promise<void> {
    console.log('Actualizando personal:', personal);
    const res = await fetch(`${API_BASE_URL}/personal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personal)
    });
    if (!res.ok) throw new Error('Error al actualizar personal');
    notify({
        title: 'Personal actualizado',
        message: `Se ha actualizado el personal correctamente.`,
        duration: 3000,
        type: 'success'
    });
}