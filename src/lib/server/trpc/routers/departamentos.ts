import { router, publicProcedure, authedProcedure } from '../init';
import { getDepartamentos, getDepartamentoByName, updateDepartamento as updateDepartamentoDB } from '../../departamento';
import { updateDepartamentoSchema } from '../schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Departamento } from '$lib/types/gen';

export const departamentosRouter = router({
  // Get all departamentos
 getAll: authedProcedure
    .query(async () => {
      try {
        return await getDepartamentos();
      } catch (error) {
        console.error('Error fetching departamentos:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching departamentos'
        });
      }
    }),

  // Get departamento by name
  getByName: authedProcedure
    .input(
      z.object({
        DeptName: z.string()
      })
    )
    .query(async ({ input }) => {
      try {
        const departamento = await getDepartamentoByName(input.DeptName);
        if (!departamento) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Departamento not found'
          });
        }
        return departamento;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching departamento by name:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching departamento by name'
        });
      }
    }),

  // Update departamento
 update: authedProcedure
    .input(updateDepartamentoSchema)
    .mutation(async ({ input }) => {
      try {
        await updateDepartamentoDB(input);
        return { success: true, message: 'Departamento updated successfully' };
      } catch (error) {
        console.error('Error updating departamento:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating departamento'
        });
      }
    }),
});