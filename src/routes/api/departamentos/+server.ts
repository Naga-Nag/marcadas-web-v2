import { json } from "@sveltejs/kit";
import {
     getDepartamentos,
     updateDepartamento,
     getDepartamentoByName
} from "$lib/server/departamento";

// GET /api/departamentos
export async function GET({ url }) {
     try {
          const name = url.searchParams.get('name');
          if (name) {
               const departamento = await getDepartamentoByName(name);
               return json(departamento);
          } else {
               const departamentos = await getDepartamentos();
               return json(departamentos);
          }
     } catch (error) {
          console.error('Error fetching departamentos:', error);
          return json({ error: 'Error al obtener los departamentos' }, { status: 500 });
     }
}

// PUT /api/departamentos/sello
export async function PUT({ request }) {
     try {
          const body = await request.json();
          const result = await updateDepartamento(body);
          return json({ message: 'Departamento actualizado correctamente', result });
     } catch (error) {
          console.error('Error updating departamento:', error);
          return json({ error: 'Error al actualizar el departamento' }, { status: 500 });
     }
}

