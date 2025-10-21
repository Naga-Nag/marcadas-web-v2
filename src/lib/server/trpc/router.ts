import { router } from './init';
import { personalRouter } from './routers/personal';
import { departamentosRouter } from './routers/departamentos';
import { usuariosRouter } from './routers/usuarios';
import { marcadasRouter } from './routers/marcadas';

/**
 * Main tRPC router that combines all feature routers
 */
export const appRouter = router({
  personal: personalRouter,
  departamentos: departamentosRouter,
  usuarios: usuariosRouter,
  marcadas: marcadasRouter,
});

export type AppRouter = typeof appRouter;