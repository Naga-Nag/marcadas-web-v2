import type { RequestHandler } from './$types';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '$lib/server/trpc/router';
import { createContext } from '$lib/server/trpc/context';

export const GET: RequestHandler = async (event) => {
    try {
        console.log('TRPC :: Processing request to:', event.url.pathname);
        console.log('TRPC :: User in locals:', !!event.locals.usuario);
        
        return await fetchRequestHandler({
            endpoint: '/api/trpc',
            req: event.request,
            router: appRouter,
            createContext: () => createContext(event)
        });
    } catch (error) {
        console.error('TRPC :: Error in request handler:', error);
        // Return a proper JSON error response instead of letting SvelteKit return HTML
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};

export const POST = GET;