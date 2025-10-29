import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { departamentosRouter } from '$lib/server/trpc/routers/departamentos';
import { usuariosRouter } from '$lib/server/trpc/routers/usuarios';
import { personalRouter } from '$lib/server/trpc/routers/personal';
import { marcadasRouter } from '$lib/server/trpc/routers/marcadas';
import { createMockContext } from '../setup';

describe('Authentication Middleware Tests', () => {
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

  describe('Public Procedures', () => {
    it('should allow unauthenticated access to public procedures', async () => {
      // Login procedure is public
      const result = await userTester.call('usuarios.login', {
        username: 'testuser',
        password: 'password'
      }, createMockContext()); // No user context
      
      // Login returns data instead of throwing UNAUTHORIZED
      expect(result.success).toBe(true);
    });

    it('should allow authenticated access to public procedures', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('login', {
        username: 'testuser',
        password: 'password'
      }, ctx);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Authenticated Procedures', () => {
    it('should allow access to authed procedures for authenticated users', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Test various authed procedures
      const deptResult = await deptTester.call('departamentos.getAll', undefined, ctx);
      expect(deptResult.success).toBe(true);
      
      const personalResult = await personalTester.call('personal.getAll', undefined, ctx);
      expect(personalResult.success).toBe(true);
      
      const marcadasResult = await marcadasTester.call('marcadas.getDelDia', {
        departamento: 'IT',
        fecha: '2023-01-01'
      }, ctx);
      expect(marcadasResult.success).toBe(true);
    });

    it('should deny access to authed procedures for unauthenticated users', async () => {
      const unauthCtx = createMockContext(); // No user context

      // Test various authed procedures
      const deptResult = await deptTester.call('departamentos.getAll', undefined, unauthCtx);
      expect(deptResult.success).toBe(false);
      expect(deptResult.code).toBe('UNAUTHORIZED');
      expect(deptResult.error).toBe('User not authenticated');
      
      const personalResult = await personalTester.call('personal.getAll', undefined, unauthCtx);
      expect(personalResult.success).toBe(false);
      expect(personalResult.code).toBe('UNAUTHORIZED');
      expect(personalResult.error).toBe('User not authenticated');
      
      const marcadasResult = await marcadasTester.call('marcadas.getDelDia', {
        departamento: 'IT',
        fecha: '2023-01-01'
      }, unauthCtx);
      expect(marcadasResult.success).toBe(false);
      expect(marcadasResult.code).toBe('UNAUTHORIZED');
      expect(marcadasResult.error).toBe('User not authenticated');
    });

    it('should preserve user context for authenticated procedures', async () => {
      const testUser = { 
        username: 'testuser', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR'] 
      };
      const ctx = createMockContext(testUser);

      // Mock the database function to verify context was passed correctly
      const originalGetAll = usuariosRouter._def.procedures['getAll'];
      
      // We can't easily test the internal context passing, but we can verify
      // that the middleware allows the procedure to execute with the user context
      const result = await userTester.call('usuarios.getAll', undefined, ctx);
      expect(result.success).toBe(true); // If auth middleware worked, this should succeed
    });
  });

  describe('Admin Procedures', () => {
    it('should allow access to admin procedures for admin users', async () => {
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const result = await userTester.call('usuarios.getAll', undefined, adminCtx);
      expect(result.success).toBe(true);
    });

    it('should deny access to admin procedures for non-admin users', async () => {
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('usuarios.getAll', undefined, userCtx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should deny access to admin procedures for unauthenticated users', async () => {
      const unauthCtx = createMockContext(); // No user context

      const result = await userTester.call('usuarios.getAll', undefined, unauthCtx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should properly check role in admin middleware', async () => {
      // Test with different roles
      const supervisorCtx = createMockContext({ 
        username: 'supervisor', 
        role: 'supervisor', // Not admin
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('usuarios.getAll', undefined, supervisorCtx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });
  });

  describe('Self-Management Procedures', () => {
    it('should allow users to access their own data', async () => {
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('usuarios.getByUsername', { username: 'user1' }, userCtx);
      expect(result.success).toBe(true);
    });

    it('should deny users access to other users\' data', async () => {
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('usuarios.getByUsername', { username: 'admin' }, userCtx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Access denied');
    });

    it('should allow admin users to access any user\'s data', async () => {
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const result = await userTester.call('usuarios.getByUsername', { username: 'user1' }, adminCtx);
      expect(result.success).toBe(true);
    });

    it('should allow users to update their own data', async () => {
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('usuarios.update', { username: 'user1', role: 'updated' }, userCtx);
      expect(result.success).toBe(true);
    });

    it('should deny users from updating other users\' data', async () => {
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await userTester.call('usuarios.update', { username: 'admin', role: 'updated' }, userCtx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Access denied');
    });
  });

 describe('Middleware Chaining', () => {
    it('should properly chain authentication middleware', async () => {
      // This test verifies that the middleware properly chains and passes
      // the context from one to the next
      
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR'] 
      });

      // If the middleware chain works correctly, an admin user should be able to
      // access admin procedures
      const result = await userTester.call('usuarios.getAll', undefined, ctx);
      expect(result.success).toBe(true);
    });

    it('should stop execution if authentication fails', async () => {
      const unauthCtx = createMockContext(); // No user context

      // If authentication middleware works correctly, it should prevent
      // execution of the actual procedure
      const result = await userTester.call('usuarios.getAll', undefined, unauthCtx);
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      // The actual procedure should never execute if auth fails
    });
  });
});