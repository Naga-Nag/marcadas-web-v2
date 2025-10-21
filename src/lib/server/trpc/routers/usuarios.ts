import { router, publicProcedure, authedProcedure, adminProcedure } from '../init';
import { getUsuarios, getUsuario, createUsuario, updateUsuario, deleteUsuario, loginWebUser } from '../../usuarios';
import { createUsuarioSchema, updateUsuarioSchema, loginUsuarioSchema, deleteSchema } from '../schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Usuario } from '$lib/types/gen';

export const usuariosRouter = router({
 // Login procedure - public
  login: publicProcedure
    .input(loginUsuarioSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await loginWebUser(input.username, input.password);
        if ('error' in result) {
          throw new TRPCError({ 
            code: 'UNAUTHORIZED', 
            message: result.error 
          });
        }
        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error during login:', error);
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Login failed' 
        });
      }
    }),

  // Get all usuarios - admin only
  getAll: adminProcedure
    .query(async () => {
      try {
        return await getUsuarios();
      } catch (error) {
        console.error('Error fetching usuarios:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching usuarios'
        });
      }
    }),

  // Get usuario by username - admin only or self
  getByUsername: authedProcedure
    .input(
      z.object({
        username: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Allow user to get their own info, or admin to get any user
        if (ctx.user.username !== input.username && ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Access denied'
          });
        }
        
        const usuario = await getUsuario(input.username);
        if (!usuario) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Usuario not found'
          });
        }
        return usuario;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching usuario by username:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching usuario'
        });
      }
    }),

  // Create new usuario - admin only
  create: adminProcedure
    .input(createUsuarioSchema)
    .mutation(async ({ input }) => {
      try {
        // Create a complete Usuario object from the input
        const usuarioToCreate: Usuario = {
          id: 0, // Will be set by the database
          username: input.username,
          password: input.password,
          role: input.role,
          departamento: input.departamento || '',
          departamentosPermitidos: input.departamentosPermitidos || []
        };
        await createUsuario(usuarioToCreate);
        return { success: true, message: 'Usuario created successfully' };
      } catch (error) {
        console.error('Error creating usuario:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating usuario'
        });
      }
    }),

  // Update usuario - admin only or self
  update: authedProcedure
    .input(updateUsuarioSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Allow user to update their own info, or admin to update any user
        if (ctx.user.username !== input.username && ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Access denied'
          });
        }
        
        await updateUsuario(input);
        return { success: true, message: 'Usuario updated successfully' };
      } catch (error) {
        console.error('Error updating usuario:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating usuario'
        });
      }
    }),

  // Delete usuario - admin only
 delete: adminProcedure
    .input(deleteSchema)
    .mutation(async ({ input }) => {
      try {
        await deleteUsuario(input.username);
        return { success: true, message: 'Usuario deleted successfully' };
      } catch (error) {
        console.error('Error deleting usuario:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error deleting usuario'
        });
      }
    }),
});