import { json, error } from '@sveltejs/kit';
import { getPersonal, getPersonalById, createPersonal, updatePersonal } from '$lib/server/personal';

// GET /api/personal
export async function GET({ url }) {
    try {
        const id = url.searchParams.get('id');
        if (id) {
            const personal = await getPersonalById(id);
            if (!personal) throw error(404, 'No encontrado');
            return json(personal);
        }
        const personal = await getPersonal();
        return json(personal);
    } catch (err) {
        console.error(err);
        throw error(500, 'Error al obtener personal');
    }
}

// POST /api/personal
export async function POST({ request }) {
    try {
        const data = await request.json();
        const nuevo = await createPersonal(data);
        return json(nuevo, { status: 201 });
    } catch (err) {
        console.error(err);
        throw error(500, 'Error al crear personal');
    }
}

// PUT /api/personal
export async function PUT({ request }) {
    try {
        const data = await request.json();
        await updatePersonal(data);
        return json({ ok: true });
    } catch (err) {
        console.error(err);
        throw error(500, 'Error al actualizar personal');
    }
}