import { json } from "@sveltejs/kit";
import { getDepartamentos } from "$lib/server/departamento";

export async function GET() {
     try {
          const departamentos = await getDepartamentos();
          return json(departamentos);
     } catch (error) {
          console.error('Error fetching departamentos:', error);
          return json({ error: 'Error al obtener los departamentos' }, { status: 500 });
     }
}