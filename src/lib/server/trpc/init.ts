import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware to check if user is authenticated
 */
export const authedProcedure = t.procedure.use(
  t.middleware(({ next, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
    }
    return next({
      ctx: {
        user: ctx.user,
      },
    });
  })
);

/**
 * Middleware to check if user has admin role
 */
export const adminProcedure = t.procedure.use(
  t.middleware(({ next, ctx }) => {
    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' });
    }
    return next({
      ctx: {
        user: ctx.user,
      },
    });
  })
);