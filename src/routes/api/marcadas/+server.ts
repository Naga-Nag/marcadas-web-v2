import { json } from '@sveltejs/kit';
import { getMarcadasDelDia, getMarcadasEstandar } from '$lib/server/marcadas';

export async function GET({ url }) {
    const departamento = url.searchParams.get('departamento');
    const fecha = url.searchParams.get('fecha');
    const funcion = url.searchParams.get('funcion');
    if (!departamento || !fecha) {
        return json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    try {
        let marcadas;
        if (funcion === 'estandar') {
            marcadas = await getMarcadasEstandar(departamento, fecha);
        } else if (funcion === 'delDia') {
            marcadas = await getMarcadasDelDia(departamento, fecha);
        }
        return json(marcadas);
    } catch (error) {
        console.error('Error fetching marcadas:', error);
        return json({ error: 'Error al obtener las marcadas' }, { status: 500 });
    }
}