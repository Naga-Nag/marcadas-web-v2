import { writable } from 'svelte/store';
import type { shortUsuario } from '$lib/types/gen';


export const usuarioStore = writable<shortUsuario | null>(null);

export const setUsuario = (user: shortUsuario) => {
    let usuario: shortUsuario | null = {
        ipaddr: user.ipaddr || null,
        username: user.username,
        role: user.role || null,
        departamento: user.departamento || null,
        departamentosPermitidos: user.departamentosPermitidos || null
    };
    usuarioStore.set(usuario);
};

export const clearUsuario = () => {
    usuarioStore.set({} as shortUsuario);
}

export const isLoggedIn = () => {
    let loggedIn: boolean = false;
    usuarioStore.subscribe((value) => {
        loggedIn = value !== null;
    })();
    return loggedIn;
}
export const isAdmin = () => {
    let admin: boolean = false;
    usuarioStore.subscribe((value) => {
        admin = value?.role === "ADMIN";
    })();
    return admin;
}

export function getUsuario(): shortUsuario | null {
    let usuario: shortUsuario | null = null;
    usuarioStore.subscribe((value) => {
        usuario = value;
    })();
    return usuario;
}

usuarioStore.subscribe((value) => {
    console.log("Store :: Usuario: ", value);
})
