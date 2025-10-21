import type { RequestEvent } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';
import type { Usuario, shortUsuario } from '$lib/types/gen';

/**
 * User type for context (based on shortUsuario which is what's stored in session)
 */
export type ContextUser = Omit<shortUsuario, 'ipaddr'>;

/**
 * Creates the tRPC context for each request
 */
export async function createContext(event: RequestEvent) {
  return {
    event,
    user: event.locals.usuario ? {
      username: event.locals.usuario.username,
      role: event.locals.usuario.role || '',
      departamento: event.locals.usuario.departamento || null,
      departamentosPermitidos: event.locals.usuario.departamentosPermitidos || [],
    } : undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;