import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { usuariosRouter } from '$lib/server/trpc/routers/usuarios';
import { createMockContext, mockDatabase } from '../setup';

describe('Usuarios Router - Unit Tests', () => {
  let tester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    tester = createTRPCProcedureTester(usuariosRouter);
    vi.clearAllMocks();
  });

  describe('login procedure', () => {
    it('should successfully login with valid credentials', async () => {
      const input = { username: 'admin', password: 'valid_password' };
      const result = await tester.call('login', input, createMockContext());
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        WebUser: {
          id: 1,
          username: 'admin',
          password: 'hashed_password',
          role: 'admin',
          departamento: 'IT',
          departamentosPermitidos: ['IT', 'HR', 'Finance']
        },
        token: 'mock_jwt_token'
      });
    });

    it('should return error for invalid credentials', async () => {
      const input = { username: 'admin', password: 'invalid_password' };
      const result = await tester.call('login', input, createMockContext());
      
      expect(result.success).toBe(true); // Login procedure returns error object instead of throwing
      expect(result.data).toEqual({ error: 'Credenciales incorrectas' });
    });

    it('should handle database errors gracefully', async () => {
      // Mock database to throw an error
      mockDatabase.loginWebUser.mockRejectedValueOnce(new Error('Database error'));

      const input = { username: 'admin', password: 'valid_password' };
      const result = await tester.call('login', input, createMockContext());
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Login failed');
    });
  });

  describe('getAll procedure', () => {
    it('should return all usuarios for admin user', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDatabase.getUsuarios());
    });

    it('should throw UNAUTHORIZED error for non-admin user', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Mock database to throw an error
      mockDatabase.getUsuarios.mockRejectedValueOnce(new Error('Database error'));

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching usuarios');
    });
  });

  describe('getByUsername procedure', () => {
    it('should return usuario for admin user accessing any user', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const input = { username: 'user1' };
      const result = await tester.call('getByUsername', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 2,
        username: 'user1',
        password: 'hashed_password',
        role: 'user',
        departamento: 'IT',
        departamentosPermitidos: ['IT']
      });
    });

    it('should return usuario for user accessing their own info', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { username: 'user1' };
      const result = await tester.call('getByUsername', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 2,
        username: 'user1',
        password: 'hashed_password',
        role: 'user',
        departamento: 'IT',
        departamentosPermitidos: ['IT']
      });
    });

    it('should throw UNAUTHORIZED error for user accessing another user', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { username: 'admin' }; // Trying to access admin's info
      const result = await tester.call('getByUsername', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Access denied');
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { username: 'user1' };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getByUsername', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should throw NOT_FOUND error for non-existent usuario', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Mock to return null for non-existent usuario
      mockDatabase.getUsuario.mockResolvedValueOnce(null);

      const input = { username: 'nonexistent' };
      const result = await tester.call('getByUsername', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toBe('Usuario not found');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Mock database to throw an error
      mockDatabase.getUsuario.mockRejectedValueOnce(new Error('Database error'));

      const input = { username: 'user1' };
      const result = await tester.call('getByUsername', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching usuario');
    });
  });

  describe('create procedure', () => {
    it('should create usuario for admin user', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const input = { 
        username: 'newuser', 
        password: 'newpassword123', 
        role: 'user',
        departamento: 'HR',
        departamentosPermitidos: ['HR']
      };
      
      const result = await tester.call('create', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Usuario created successfully' 
      });
      expect(mockDatabase.createUsuario).toHaveBeenCalledWith({
        id: 0,
        username: 'newuser',
        password: 'newpassword123',
        role: 'user',
        departamento: 'HR',
        departamentosPermitidos: ['HR']
      });
    });

    it('should throw UNAUTHORIZED error for non-admin user', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        username: 'newuser', 
        password: 'newpassword123', 
        role: 'user' 
      };
      const result = await tester.call('create', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { 
        username: 'newuser', 
        password: 'newpassword123', 
        role: 'user' 
      };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('create', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Mock database to throw an error
      mockDatabase.createUsuario.mockRejectedValueOnce(new Error('Database error'));

      const input = { 
        username: 'newuser', 
        password: 'newpassword123', 
        role: 'user' 
      };
      const result = await tester.call('create', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error creating usuario');
    });
  });

  describe('update procedure', () => {
    it('should update usuario for admin user accessing any user', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const input = { 
        username: 'user1', 
        role: 'admin' 
      };
      
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Usuario updated successfully' 
      });
      expect(mockDatabase.updateUsuario).toHaveBeenCalledWith(input);
    });

    it('should update usuario for user accessing their own info', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        username: 'user1', 
        role: 'superuser' 
      };
      
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Usuario updated successfully' 
      });
      expect(mockDatabase.updateUsuario).toHaveBeenCalledWith(input);
    });

    it('should throw UNAUTHORIZED error for user updating another user', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        username: 'admin', // Trying to update admin's info
        role: 'user' 
      };
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Access denied');
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { username: 'user1', role: 'admin' };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Mock database to throw an error
      mockDatabase.updateUsuario.mockRejectedValueOnce(new Error('Database error'));

      const input = { username: 'user1', role: 'admin' };
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error updating usuario');
    });
  });

  describe('delete procedure', () => {
    it('should delete usuario for admin user', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const input = { username: 'user1' };
      
      const result = await tester.call('delete', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Usuario deleted successfully' 
      });
      expect(mockDatabase.deleteUsuario).toHaveBeenCalledWith('user1');
    });

    it('should throw UNAUTHORIZED error for non-admin user', async () => {
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { username: 'admin' };
      const result = await tester.call('delete', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { username: 'user1' };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('delete', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('Admin access required');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Mock database to throw an error
      mockDatabase.deleteUsuario.mockRejectedValueOnce(new Error('Database error'));

      const input = { username: 'user1' };
      const result = await tester.call('delete', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error deleting usuario');
    });
  });
});