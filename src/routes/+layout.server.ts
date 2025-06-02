import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        usuario: locals.usuario || null // Pass the user to the client
    };
};