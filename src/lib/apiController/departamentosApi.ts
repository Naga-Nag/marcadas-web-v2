import { notify } from "../components/Notification/notifications";
import { API_DEPARTAMENTOS } from "./api";
import type { Departamento } from "$lib/types/gen";

export async function fetchDepartamentos(): Promise<Departamento[]> {
    const res = await fetch(`${API_DEPARTAMENTOS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) {
        notify({ title: 'Error', message: data.error || 'Error fetching departamentos', type: 'error', duration: 3000 });
        throw new Error(data.error || 'Error fetching departamentos');
    }
    // Optionally, ensure SelloJefe is a Buffer or base64 string as needed by your frontend
    return data as Departamento[];
}

export async function updateDepartamento(departamento: Departamento): Promise<void> {
    const res = await fetch(`${API_DEPARTAMENTOS}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departamento)
    });
    const data = await res.json();
    if (!res.ok) {
        notify({ title: 'Error', message: data.error || 'Error updating departamento', type: 'error', duration: 3000 });
        throw new Error(data.error || 'Error updating departamento');
    }
    notify({ title: 'Exitoso', message: 'Departamento actualizado correctamente', type: 'success', duration: 3000 });
}