import { router, publicProcedure, authedProcedure } from '../init';
import { createPersonal, getPersonal, getPersonalById, updatePersonal } from '../../personal';
import { createPersonalSchema, updatePersonalSchema } from '../schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Personal } from '$lib/types/gen';

export const personalRouter = router({
  // Get all personal
 getAll: authedProcedure
    .query(async () => {
      try {
        return await getPersonal();
      } catch (error) {
        console.error('Error fetching personal:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching personal data'
        });
      }
    }),

  // Get personal by ID
  getById: authedProcedure
    .input(
      z.object({
        UID: z.number()
      })
    )
    .query(async ({ input }) => {
      try {
        const personal = await getPersonalById(input.UID.toString());
        if (!personal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Personal not found'
          });
        }
        return personal;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching personal by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching personal by ID'
        });
      }
    }),

  // Create new personal
  create: authedProcedure
    .input(createPersonalSchema)
    .mutation(async ({ input }) => {
      try {
        // Convert the input to match Personal type
        const personalToCreate: Personal = {
          UID: 0, // Will be set by the database
          MR: parseInt(input.MR) || 0, // Convert string to number
          Nombre: input.Nombre,
          Departamento: input.Departamento || '',
          CUIL: input.CUIL || '',
          Jornada: input.Jornada || '',
          Activo: input.Activo ? '1' : '0', // Convert boolean to string
          Foto: input.Foto || ''
        };
        return await createPersonal(personalToCreate);
      } catch (error) {
        console.error('Error creating personal:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating personal'
        });
      }
    }),

  // Update personal
  update: authedProcedure
    .input(updatePersonalSchema)
    .mutation(async ({ input }) => {
      try {
        // Convert the input to match Partial<Personal> type
        const personalToUpdate: Partial<Personal> = {
          UID: input.UID,
          MR: typeof input.MR === 'string' ? parseInt(input.MR) : input.MR,
          Nombre: input.Nombre,
          Departamento: input.Departamento,
          CUIL: input.CUIL,
          Jornada: input.Jornada,
          Activo: typeof input.Activo === 'boolean' ? (input.Activo ? '1' : '0') : input.Activo,
          Foto: input.Foto
        };
        await updatePersonal(personalToUpdate);
        return { success: true, message: 'Personal updated successfully' };
      } catch (error) {
        console.error('Error updating personal:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating personal'
        });
      }
    }),
});