import { notify } from "../components/Notification/notifications";
import { API_USUARIOS } from "./api";
import { setUsuario } from '$lib/stores/usuario';
import { invalidateAll } from '$app/navigation';
import type { shortUsuario, Usuario } from "../types/gen";
import { clearUsuario } from "$lib/stores/usuario";


export async function login(username: string, password: string) {
    console.log('API :: login: Attempting login for user', username);
    const res = await fetch(`${API_USUARIOS}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log('API :: login: Response received', { status: res.status, data });
    
    if (!res.ok) {
        notify({ title: 'Error de autenticación', message: data.error || 'Credenciales incorrectas', type: 'error', duration: 3000 });
        throw new Error(data.error || 'Error en autenticación');
    }
    
    console.log('API :: login: Login successful, setting user and token');
    notify({ title: 'Login exitoso', message: 'Bienvenido', type: 'success', duration: 3000 });
    setUsuario(data.user); // <-- aca lo seteas en el globalStore
    localStorage.setItem('token', data.token);
    window.location.href = '/';
    return data; // { user, token }
}

export async function logout() {
    console.log('API :: logout: Initiating logout process');
    await fetch(`${API_USUARIOS}/logout`, {
        method: 'GET'
    });

    notify({ title: 'Se ha cerrado la sesión', message: 'Hasta pronto', type: 'success', duration: 3000 });
    clearUsuario();
    // Hard redirect to clear all state and reload fresh session
    await invalidateAll(); // Ensure all load functions refetch
	window.location.href = '/login';
}


export async function fetchUsuarios() {
    const res = await fetch(`${API_USUARIOS}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Error fetching usuarios');
    }
    return data;
}

export async function createUsuario(usuario: Usuario) {
    const res = await fetch(`${API_USUARIOS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Error creando usuario');
    }
    notify({ title: 'Usuario creado', message: 'El usuario se ha creado correctamente', type: 'success', duration: 3000 });
    return data;
}

export async function updateUsuario(usuario: Partial<shortUsuario>) {
    const res = await fetch(`${API_USUARIOS}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Error actualizando usuario');
    }
    notify({ title: 'Usuario actualizado', message: 'El usuario se ha actualizado correctamente', type: 'success', duration: 3000 });
    return data;
}

export async function deleteUsuario(username: string) {
    const res = await fetch(`${API_USUARIOS}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Error eliminando usuario');
    }
    notify({ title: 'Usuario eliminado', message: 'El usuario se ha eliminado correctamente', type: 'success', duration: 3000 });
    return data;
}
