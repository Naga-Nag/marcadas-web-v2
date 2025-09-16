import { json } from '@sveltejs/kit';
import { loginWebUser } from '$lib/server/usuarios';

export async function POST({ request, cookies }) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return json({ error: 'Faltan credenciales' }, { status: 400 });
        }

        const result = await loginWebUser(username, password);
        
        if ('error' in result) {
            return json({ error: result.error }, { status: 401 });
        }
        
        const { WebUser, token } = result;
        
        cookies.set('token', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: Bun.env.BUILD === 'production',
            maxAge: 60 * 60 * 8 // 8 horas
        });
        
        // Return user data without password
        const { password: _, ...usuario } = WebUser;
        return json({ ok: true, usuario });
    } catch (err) {
        console.error('Login error:', err);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}