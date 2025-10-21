import { router, publicProcedure, authedProcedure } from '../init';
import { getMarcadasDelDia, getMarcadasEstandar, getMarcadasEntreFechas } from '../../marcadas';
import { getMarcadasSchema } from '../schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const marcadasRouter = router({
  // Get marcadas del día
  getDelDia: authedProcedure
    .input(
      z.object({
        departamento: z.string(),
        fecha: z.string()
      })
    )
    .query(async ({ input }) => {
      try {
        return await getMarcadasDelDia(input.departamento, input.fecha);
      } catch (error) {
        console.error('Error fetching marcadas del día:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching marcadas del día'
        });
      }
    }),

  // Get marcadas estándar
  getEstandar: authedProcedure
    .input(
      z.object({
        departamento: z.string(),
        fecha: z.string()
      })
    )
    .query(async ({ input }) => {
      try {
        return await getMarcadasEstandar(input.departamento, input.fecha);
      } catch (error) {
        console.error('Error fetching marcadas estándar:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching marcadas estándar'
        });
      }
    }),

  // Get marcadas entre fechas (if needed)
 getEntreFechas: authedProcedure
    .input(
      z.object({
        departamento: z.string(),
        fechaInicial: z.string(),
        fechaFinal: z.string()
      })
    )
    .query(async ({ input }) => {
      try {
        return await getMarcadasEntreFechas(input.departamento, input.fechaInicial, input.fechaFinal);
      } catch (error) {
        console.error('Error fetching marcadas entre fechas:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching marcadas entre fechas'
        });
      }
    }),
});