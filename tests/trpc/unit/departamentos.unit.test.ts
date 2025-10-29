import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { departamentosRouter } from '$lib/server/trpc/routers/departamentos';
import { createMockContext, mockDatabase } from '../setup';
import { TRPCError } from '@trpc/server';

describe('Departamentos Router - Unit Tests', () => {
  let tester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    tester = createTRPCProcedureTester(departamentosRouter);
    vi.clearAllMocks();
  });

  describe('getAll procedure', () => {
    it('should return all departamentos for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDatabase.getDepartamentos());
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getAll', undefined, ctx);
      
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
      mockDatabase.getDepartamentos.mockRejectedValueOnce(new Error('Database error'));

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching departamentos');
    });
  });

 describe('getByName procedure', () => {
    it('should return departamento by name for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { DeptName: 'IT' };
      const result = await tester.call('getByName', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        Deptid: 1,
        DeptName: 'IT',
        SelloJefe: null,
        leyendaJefe: 'IT Department'
      });
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { DeptName: 'IT' };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getByName', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should throw NOT_FOUND error for non-existent departamento', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { DeptName: 'NonExistentDept' };
      const result = await tester.call('getByName', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toBe('Departamento not found');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getDepartamentoByName.mockRejectedValueOnce(new Error('Database error'));

      const input = { DeptName: 'IT' };
      const result = await tester.call('getByName', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching departamento by name');
    });
  });

 describe('update procedure', () => {
    it('should update departamento for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        Deptid: 1, 
        DeptName: 'Updated IT', 
        leyendaJefe: 'Updated IT Department' 
      };
      
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Departamento updated successfully' 
      });
      expect(mockDatabase.updateDepartamento).toHaveBeenCalledWith(input);
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { Deptid: 1, DeptName: 'Updated IT' };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('update', input, ctx);
      
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
      mockDatabase.updateDepartamento.mockRejectedValueOnce(new Error('Database error'));

      const input = { Deptid: 1, DeptName: 'Updated IT' };
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error updating departamento');
    });
  });
});