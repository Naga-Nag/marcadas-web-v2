import { json } from '@sveltejs/kit';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '$lib/server/usuarios';

export async function GET({ url }) {
    const usuarios = await getUsuarios();
    return json(usuarios);
}

export async function POST({ request }) {
    try {
        const usuario = await request.json();
        const result = await createUsuario(usuario);
        return json({ success: true, result });
    } catch (err) {
        return json({ error: 'Error creando usuario' }, { status: 500 });
    }
}

export async function PUT({ request }) {
    try {
        const usuario = await request.json();
        const result = await updateUsuario(usuario);
        return json({ success: true, result });
    } catch (err) {
        return json({ error: 'Error actualizando usuario' }, { status: 500 });
    }
}

export async function DELETE({ request }) {
    try {
        const { username } = await request.json();
        const result = await deleteUsuario(username);
        return json({ success: true, result });
    } catch (err) {
        return json({ error: 'Error eliminando usuario' }, { status: 500 });
    }
}