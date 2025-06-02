import { json } from '@sveltejs/kit';
import { getUsuario } from '$lib/server/usuarios';
import jwt from 'jsonwebtoken';

export async function POST({ request, cookies }) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return json({ error: 'Faltan credenciales' }, { status: 400 });
        }

        const token = jwt.sign({ username }, Bun.env.JWT_SECRET!, { expiresIn: '8h' });

        cookies.set('token', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: Bun.env.BUILD === 'production',
            maxAge: 60 * 60 * 8 // 8 horas
        });
        const usuario = await getUsuario(username);
        return json({ ok: true, usuario });
    } catch (err) {
        return json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
}