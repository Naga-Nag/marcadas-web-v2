import type { RequestHandler } from './$types';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '$lib/server/trpc/router';
import type { ContextUser } from '$lib/server/trpc/context';

export const GET: RequestHandler = (event) => {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req: event.request,
        router: appRouter,
        createContext: () => {
            return {
                event,
                user: event.locals.usuario ? {
                    username: event.locals.usuario.username,
                    role: event.locals.usuario.role || '',
                    departamento: event.locals.usuario.departamento || null,
                    departamentosPermitidos: event.locals.usuario.departamentosPermitidos || [],
                } : undefined
            };
        }
    });
};

export const POST = GET;