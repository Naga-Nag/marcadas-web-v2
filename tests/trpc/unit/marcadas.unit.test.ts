import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { marcadasRouter } from '$lib/server/trpc/routers/marcadas';
import { createMockContext, mockDatabase } from '../setup';

describe('Marcadas Router - Unit Tests', () => {
  let tester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    tester = createTRPCProcedureTester(marcadasRouter);
    vi.clearAllMocks();
  });

  describe('getDelDia procedure', () => {
    it('should return marcadas del día for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        departamento: 'IT',
        fecha: '2023-01-01'
      };
      const result = await tester.call('getDelDia', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDatabase.getMarcadasDelDia());
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { 
        departamento: 'IT',
        fecha: '2023-01-01'
      };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getDelDia', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getMarcadasDelDia.mockRejectedValueOnce(new Error('Database error'));

      const input = { 
        departamento: 'IT',
        fecha: '2023-01-01'
      };
      const result = await tester.call('getDelDia', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching marcadas del día');
    });
  });

 describe('getEstandar procedure', () => {
    it('should return marcadas estándar for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        departamento: 'IT',
        fecha: '2023-01-01'
      };
      const result = await tester.call('getEstandar', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDatabase.getMarcadasEstandar());
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { 
        departamento: 'IT',
        fecha: '2023-01-01'
      };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getEstandar', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getMarcadasEstandar.mockRejectedValueOnce(new Error('Database error'));

      const input = { 
        departamento: 'IT',
        fecha: '2023-01-01'
      };
      const result = await tester.call('getEstandar', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching marcadas estándar');
    });
  });

  describe('getEntreFechas procedure', () => {
    it('should return marcadas entre fechas for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        departamento: 'IT',
        fechaInicial: '2023-01-01',
        fechaFinal: '2023-01-31'
      };
      const result = await tester.call('getEntreFechas', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDatabase.getMarcadasEntreFechas());
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { 
        departamento: 'IT',
        fechaInicial: '2023-01-01',
        fechaFinal: '2023-01-31'
      };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getEntreFechas', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getMarcadasEntreFechas.mockRejectedValueOnce(new Error('Database error'));

      const input = { 
        departamento: 'IT',
        fechaInicial: '2023-01-01',
        fechaFinal: '2023-01-31'
      };
      const result = await tester.call('getEntreFechas', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching marcadas entre fechas');
    });
  });
});