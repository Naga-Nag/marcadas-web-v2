import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { departamentosRouter } from '$lib/server/trpc/routers/departamentos';
import { usuariosRouter } from '$lib/server/trpc/routers/usuarios';
import { personalRouter } from '$lib/server/trpc/routers/personal';
import { marcadasRouter } from '$lib/server/trpc/routers/marcadas';
import { createMockContext, mockDatabase } from '../setup';
import { TRPCError } from '@trpc/server';

describe('Error Handling Verification Tests', () => {
  let deptTester: ReturnType<typeof createTRPCProcedureTester>;
  let userTester: ReturnType<typeof createTRPCProcedureTester>;
  let personalTester: ReturnType<typeof createTRPCProcedureTester>;
  let marcadasTester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    deptTester = createTRPCProcedureTester(departamentosRouter);
    userTester = createTRPCProcedureTester(usuariosRouter);
    personalTester = createTRPCProcedureTester(personalRouter);
    marcadasTester = createTRPCProcedureTester(marcadasRouter);
    vi.clearAllMocks();
  });

  describe('TRPCError Handling', () => {
    it('should properly throw TRPCError with correct codes and messages', async () => {
      // Test unauthorized access
      const unauthCtx = createMockContext(); // No user context
      
      const deptResult = await deptTester.call('getAll', undefined, unauthCtx);
      expect(deptResult.success).toBe(false);
      expect(deptResult.code).toBe('UNAUTHORIZED');
      expect(deptResult.error).toBe('User not authenticated');
      
      const userResult = await userTester.call('getAll', undefined, unauthCtx);
      expect(userResult.success).toBe(false);
      expect(userResult.code).toBe('UNAUTHORIZED');
      expect(userResult.error).toBe('Admin access required');
      
      const personalResult = await personalTester.call('getAll', undefined, unauthCtx);
      expect(personalResult.success).toBe(false);
      expect(personalResult.code).toBe('UNAUTHORIZED');
      expect(personalResult.error).toBe('User not authenticated');
    });

    it('should properly handle NOT_FOUND errors', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock to return null for non-existent departamento
      mockDatabase.getDepartamentoByName.mockResolvedValueOnce(null);

      const result = await deptTester.call('getByName', { DeptName: 'NonExistent' }, ctx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toBe('Departamento not found');
    });

    it('should properly handle INTERNAL_SERVER_ERROR', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getDepartamentos.mockRejectedValueOnce(new Error('Database error'));

      const result = await deptTester.call('getAll', undefined, ctx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching departamentos');
    });

    it('should handle login errors properly', async () => {
      const result = await userTester.call('login', { 
        username: 'admin', 
        password: 'invalid_password' 
      }, createMockContext());
      
      // Login procedure returns error object instead of throwing TRPCError
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ error: 'Credenciales incorrectas' });
    });
  });

  describe('Error Message Consistency', () => {
    it('should use consistent error messages across procedures', async () => {
      const unauthCtx = createMockContext(); // No user context
      
      // All authenticated procedures should return the same UNAUTHORIZED message
      const deptResult = await deptTester.call('departamentos.getAll', undefined, unauthCtx);
      const personalResult = await personalTester.call('personal.getAll', undefined, unauthCtx);
      const marcadasResult = await marcadasTester.call('marcadas.getDelDia', {
        departamento: 'IT',
        fecha: '2023-01-01'
      }, unauthCtx);
      
      expect(deptResult.code).toBe('UNAUTHORIZED');
      expect(deptResult.error).toBe('User not authenticated');
      
      expect(personalResult.code).toBe('UNAUTHORIZED');
      expect(personalResult.error).toBe('User not authenticated');
      
      expect(marcadasResult.code).toBe('UNAUTHORIZED');
      expect(marcadasResult.error).toBe('User not authenticated');
    });

    it('should use consistent admin error messages', async () => {
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Admin-only procedures should return the same message
      const getAllResult = await userTester.call('getAll', undefined, userCtx);
      const createResult = await userTester.call('create', { 
        username: 'newuser', 
        password: 'password', 
        role: 'user' 
      }, userCtx);
      const deleteResult = await userTester.call('delete', { username: 'user1' }, userCtx);
      
      expect(getAllResult.code).toBe('UNAUTHORIZED');
      expect(getAllResult.error).toBe('Admin access required');
      
      expect(createResult.code).toBe('UNAUTHORIZED');
      expect(createResult.error).toBe('Admin access required');
      
      expect(deleteResult.code).toBe('UNAUTHORIZED');
      expect(deleteResult.error).toBe('Admin access required');
    });
  });

  describe('Database Error Handling', () => {
    it('should properly handle database connection errors', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock all database methods to throw connection errors
      mockDatabase.getDepartamentos.mockRejectedValueOnce(new Error('Connection failed'));
      mockDatabase.getPersonal.mockRejectedValueOnce(new Error('Connection failed'));
      mockDatabase.getUsuarios.mockRejectedValueOnce(new Error('Connection failed'));
      mockDatabase.getMarcadasDelDia.mockRejectedValueOnce(new Error('Connection failed'));

      const deptResult = await deptTester.call('departamentos.getAll', undefined, ctx);
      const personalResult = await personalTester.call('personal.getAll', undefined, ctx);
      const userResult = await userTester.call('usuarios.getAll', undefined, ctx);
      const marcadasResult = await marcadasTester.call('marcadas.getDelDia', {
        departamento: 'IT',
        fecha: '2023-01-01'
      }, ctx);

      expect(deptResult.code).toBe('INTERNAL_SERVER_ERROR');
      expect(deptResult.error).toBe('Error fetching departamentos');
      
      expect(personalResult.code).toBe('INTERNAL_SERVER_ERROR');
      expect(personalResult.error).toBe('Error fetching personal data');
      
      expect(userResult.code).toBe('INTERNAL_SERVER_ERROR');
      expect(userResult.error).toBe('Error fetching usuarios');
      
      expect(marcadasResult.code).toBe('INTERNAL_SERVER_ERROR');
      expect(marcadasResult.error).toBe('Error fetching marcadas del día');
    });

    it('should properly handle specific database errors', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock specific database errors
      mockDatabase.getDepartamentoByName.mockRejectedValueOnce(new Error('Query failed'));

      const result = await deptTester.call('getByName', { DeptName: 'IT' }, ctx);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching departamento by name');
    });
  });

  describe('Input Validation Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Test invalid input for getByName (missing required field)
      const result = await deptTester.call('getByName', {}, ctx);
      expect(result.success).toBe(false);
      // This should be a validation error, which tRPC handles automatically
    });

    it('should handle invalid input for update procedures', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Test invalid input for update (missing required field in schema)
      const result = await deptTester.call('update', { DeptName: '' }, ctx); // Empty DeptName should fail validation
      expect(result.success).toBe(false);
      // This should be a validation error
    });
 });

  describe('Error Logging Verification', () => {
    it('should log errors appropriately', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock database to throw an error
      mockDatabase.getDepartamentos.mockRejectedValueOnce(new Error('Database error'));

      await deptTester.call('getAll', undefined, ctx);

      // Verify that console.error was called (simulating the error logging in the actual procedures)
      expect(consoleSpy).toHaveBeenCalled();
      
      // Clean up
      consoleSpy.mockRestore();
    });
  });
});