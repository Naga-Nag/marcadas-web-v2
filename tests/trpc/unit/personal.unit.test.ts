import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { personalRouter } from '$lib/server/trpc/routers/personal';
import { createMockContext, mockDatabase } from '../setup';

describe('Personal Router - Unit Tests', () => {
  let tester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    tester = createTRPCProcedureTester(personalRouter);
    vi.clearAllMocks();
  });

  describe('getAll procedure', () => {
    it('should return all personal for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDatabase.getPersonal());
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
      mockDatabase.getPersonal.mockRejectedValueOnce(new Error('Database error'));

      const result = await tester.call('getAll', undefined, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching personal data');
    });
  });

  describe('getById procedure', () => {
    it('should return personal by ID for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { UID: 1 };
      const result = await tester.call('getById', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        UID: 1,
        MR: '001',
        Nombre: 'John Doe',
        Departamento: 'IT',
        CUIL: '20-12345678-9',
        Jornada: 'Full-time',
        Activo: '1',
        Foto: ''
      });
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { UID: 1 };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('getById', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.error).toBe('User not authenticated');
    });

    it('should throw NOT_FOUND error for non-existent personal', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock to return null for non-existent personal
      mockDatabase.getPersonalById.mockResolvedValueOnce(null);

      const input = { UID: 999 };
      const result = await tester.call('getById', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toBe('Personal not found');
    });

    it('should handle database errors gracefully', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getPersonalById.mockRejectedValueOnce(new Error('Database error'));

      const input = { UID: 1 };
      const result = await tester.call('getById', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error fetching personal by ID');
    });
  });

  describe('create procedure', () => {
    it('should create personal for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        MR: '003', 
        Nombre: 'Bob Johnson', 
        Departamento: 'HR',
        CUIL: '20-1111-1',
        Jornada: 'Part-time',
        Activo: true,
        Foto: ''
      };
      
      const result = await tester.call('create', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        UID: 99,
        MR: 3, // Should convert string to number
        Nombre: 'Bob Johnson',
        Departamento: 'HR',
        CUIL: '20-1111111-1',
        Jornada: 'Part-time',
        Activo: '1', // Should convert boolean to string
        Foto: ''
      });
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { 
        MR: '003', 
        Nombre: 'Bob Johnson', 
        Departamento: 'HR',
        CUIL: '20-1111-1',
        Jornada: 'Part-time',
        Activo: true,
        Foto: ''
      };
      const ctx = createMockContext(); // No user context

      const result = await tester.call('create', input, ctx);
      
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
      mockDatabase.createPersonal.mockRejectedValueOnce(new Error('Database error'));

      const input = { 
        MR: '003', 
        Nombre: 'Bob Johnson', 
        Departamento: 'HR',
        CUIL: '20-11111111-1',
        Jornada: 'Part-time',
        Activo: true,
        Foto: ''
      };
      const result = await tester.call('create', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error creating personal');
    });
  });

  describe('update procedure', () => {
    it('should update personal for authenticated user', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      const input = { 
        UID: 1, 
        Nombre: 'Updated Name' 
      };
      
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Personal updated successfully' 
      });
      expect(mockDatabase.updatePersonal).toHaveBeenCalledWith({
        UID: 1,
        MR: undefined,
        Nombre: 'Updated Name',
        Departamento: undefined,
        CUIL: undefined,
        Jornada: undefined,
        Activo: undefined,
        Foto: undefined
      });
    });

    it('should throw UNAUTHORIZED error for unauthenticated user', async () => {
      const input = { UID: 1, Nombre: 'Updated Name' };
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
      mockDatabase.updatePersonal.mockRejectedValueOnce(new Error('Database error'));

      const input = { UID: 1, Nombre: 'Updated Name' };
      const result = await tester.call('update', input, ctx);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error).toBe('Error updating personal');
    });
  });
});