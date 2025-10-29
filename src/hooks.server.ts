import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { error, redirect } from '@sveltejs/kit';
import { getUsuario } from '$lib/server/usuarios';
import { iniciarServidor } from './lib/server';
const pathsProtegidos = ['/'];
const rutasPublicas = ['/login', '/api/usuario/login'];

await iniciarServidor();

export const handle = async ({ event, resolve }) => {
      if (Bun.env.JWT_SECRET === undefined) {
           console.error("HOOKS :: JWT_SECRET no definido en el entorno.");
           throw error(500, 'Error interno del servidor: JWT_SECRET no definido.');
      }
      // Permitir rutas públicas sin autenticación
      if (rutasPublicas.some(route => event.url.pathname.startsWith(route))) {
           console.log("HOOKS :: Allowing public route:", event.url.pathname);
           return resolve(event);
      }

      // For tRPC routes, we need to check authentication but don't redirect
      if (event.url.pathname.startsWith('/api/trpc/')) {
           // Check for JWT token in cookies for tRPC requests
           const token = event.cookies.get('token');
           if (token && Bun.env.JWT_SECRET) {
                try {
                     const decodedUser = jwt.verify(token, Bun.env.JWT_SECRET!) as JwtPayload;
                     const user = await getUsuario(decodedUser.username);
                     if (user) {
                          event.locals.usuario = { ...user, ipaddr: event.getClientAddress ? event.getClientAddress() : null };
                     }
                } catch (err) {
                     console.log("HOOKS :: Token verification failed for tRPC request", { error: (err as Error)?.name });
                }
           }
           return resolve(event);
      }

      // PROTEGER TODO LO DEMÁS
      const token = event.cookies.get('token');
      console.log("HOOKS :: Checking authentication for path", event.url.pathname, { hasToken: !!token });
      if (!token) {
           console.log("HOOKS :: No token found, redirecting to login");
           throw redirect(303, '/login');
      }

     let decodedUser: JwtPayload | null = null;
     try {
          decodedUser = jwt.verify(token, Bun.env.JWT_SECRET!) as JwtPayload;
          console.log("HOOKS :: Token verified successfully", { username: decodedUser.username });
     } catch (err: any) {
          console.log("HOOKS :: Token verification failed", { error: err?.name });
          event.cookies.delete('token', { path: '/', secure: false });
          clearUsuario();
          if (err?.name === 'TokenExpiredError') {
               throw redirect(303, '/login?expired=true');
          }
          throw redirect(303, '/login');
     }

     if (token && Bun.env.JWT_SECRET && decodedUser && typeof decodedUser !== 'string') {
          const user = await getUsuario(decodedUser.username);
          console.log("HOOKS :: User fetched from database", { userFound: !!user });
          if (user) {
               event.locals.usuario = { ...user, ipaddr: event.getClientAddress ? event.getClientAddress() : null };
               console.log("HOOKS :: Usuario autenticado:", user);
          } else {
               clearUsuario();
               console.error("HOOKS :: Usuario no encontrado.");
               throw error(500, 'Error interno del servidor: Usuario no encontrado.');
          }
          return resolve(event);
     } else {
          console.log("HOOKS :: Authentication failed, redirecting to login");
          event.cookies.delete('token', { path: '/' });
          throw redirect(303, '/login');
     }
};

import type { LoadEvent } from '@sveltejs/kit';
import { clearUsuario } from '$lib/stores/usuario';

export async function load({ url }: LoadEvent) {
     const expired = url.searchParams.get('expired');
     return {
          expired: expired === 'true'
     };
}