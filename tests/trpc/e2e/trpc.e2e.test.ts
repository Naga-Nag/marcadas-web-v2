import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appRouter } from '$lib/server/trpc/router';
import { createMockContext, mockDatabase, mockUsuarios, mockDepartamentos, mockPersonal, mockMarcadas } from '../setup';
import { createTRPCProcedureTester } from '../utils';

describe('End-to-End tRPC Tests with Mock Data', () => {
  let tester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    tester = createTRPCProcedureTester(appRouter);
    vi.clearAllMocks();
  });

  describe('Complete User Workflow', () => {
    it('should handle a complete user workflow from login to data operations', async () => {
      // Step 1: Login
      const loginResult = await tester.call('usuarios.login', { 
        username: 'admin', 
        password: 'valid_password' 
      }, createMockContext());
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.data).toHaveProperty('WebUser');
      expect(loginResult.data).toHaveProperty('token');
      expect(loginResult.data.WebUser.username).toBe('admin');

      // Step 2: Use authenticated context for subsequent operations
      const authedCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Step 3: Get all usuarios (admin only)
      const getAllUsuariosResult = await tester.call('usuarios.getAll', undefined, authedCtx);
      expect(getAllUsuariosResult.success).toBe(true);
      expect(Array.isArray(getAllUsuariosResult.data)).toBe(true);
      expect(getAllUsuariosResult.data.length).toBeGreaterThan(0);

      // Step 4: Get all departamentos
      const getAllDeptResult = await tester.call('departamentos.getAll', undefined, authedCtx);
      expect(getAllDeptResult.success).toBe(true);
      expect(getAllDeptResult.data).toEqual(mockDatabase.getDepartamentos());

      // Step 5: Get all personal
      const getAllPersonalResult = await tester.call('personal.getAll', undefined, authedCtx);
      expect(getAllPersonalResult.success).toBe(true);
      expect(getAllPersonalResult.data).toEqual(mockDatabase.getPersonal());

      // Step 6: Create a new usuario (admin only)
      const createUsuarioResult = await tester.call('usuarios.create', { 
        username: 'newuser', 
        password: 'password123', 
        role: 'user',
        departamento: 'HR',
        departamentosPermitidos: ['HR']
      }, authedCtx);
      expect(createUsuarioResult.success).toBe(true);
      expect(createUsuarioResult.data).toEqual({ 
        success: true, 
        message: 'Usuario created successfully' 
      });

      // Step 7: Update the newly created usuario
      const updateUsuarioResult = await tester.call('usuarios.update', { 
        username: 'newuser', 
        role: 'admin' 
      }, authedCtx);
      expect(updateUsuarioResult.success).toBe(true);
      expect(updateUsuarioResult.data).toEqual({ 
        success: true, 
        message: 'Usuario updated successfully' 
      });

      // Step 8: Get marcadas for a department
      const getMarcadasResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, authedCtx);
      expect(getMarcadasResult.success).toBe(true);
      expect(getMarcadasResult.data).toEqual(mockDatabase.getMarcadasDelDia());
    });

    it('should handle regular user workflow', async () => {
      // Step 1: Login as regular user
      const loginResult = await tester.call('usuarios.login', { 
        username: 'user1', 
        password: 'valid_password' 
      }, createMockContext());
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.data).toHaveProperty('WebUser');
      expect(loginResult.data.WebUser.username).toBe('user1');
      expect(loginResult.data.WebUser.role).toBe('user');

      // Step 2: Use authenticated context for subsequent operations
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Step 3: Get user's own information
      const getSelfResult = await tester.call('usuarios.getByUsername', { username: 'user1' }, userCtx);
      expect(getSelfResult.success).toBe(true);
      expect(getSelfResult.data.username).toBe('user1');

      // Step 4: Get departamentos (should work for authenticated users)
      const getAllDeptResult = await tester.call('departamentos.getAll', undefined, userCtx);
      expect(getAllDeptResult.success).toBe(true);

      // Step 5: Get personal data
      const getAllPersonalResult = await tester.call('personal.getAll', undefined, userCtx);
      expect(getAllPersonalResult.success).toBe(true);

      // Step 6: Get marcadas for allowed department
      const getMarcadasResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, userCtx);
      expect(getMarcadasResult.success).toBe(true);

      // Step 7: Try to access admin-only functionality (should fail)
      const adminResult = await tester.call('usuarios.getAll', undefined, userCtx);
      expect(adminResult.success).toBe(false);
      expect(adminResult.code).toBe('UNAUTHORIZED');
    });
  });

 describe('Data Consistency Tests', () => {
    it('should maintain data consistency across related operations', async () => {
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Get initial state
      const initialDeptResult = await tester.call('departamentos.getAll', undefined, adminCtx);
      expect(initialDeptResult.success).toBe(true);
      const initialDeptCount = initialDeptResult.data.length;

      // Get initial personal
      const initialPersonalResult = await tester.call('personal.getAll', undefined, adminCtx);
      expect(initialPersonalResult.success).toBe(true);
      const initialPersonalCount = initialPersonalResult.data.length;

      // Perform operations that should maintain consistency
      const createPersonalResult = await tester.call('personal.create', { 
        MR: '003', 
        Nombre: 'New Employee', 
        Departamento: 'IT' 
      }, adminCtx);
      expect(createPersonalResult.success).toBe(true);

      // Get updated personal list
      const updatedPersonalResult = await tester.call('personal.getAll', undefined, adminCtx);
      expect(updatedPersonalResult.success).toBe(true);
      expect(updatedPersonalResult.data.length).toBe(initialPersonalCount + 1);

      // Verify the new employee exists
      const newEmployee = updatedPersonalResult.data.find((p: any) => p.Nombre === 'New Employee');
      expect(newEmployee).toBeDefined();
      expect(newEmployee.Nombre).toBe('New Employee');
    });

    it('should handle data relationships properly', async () => {
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Get a specific departamento
      const deptResult = await tester.call('departamentos.getByName', { DeptName: 'IT' }, adminCtx);
      expect(deptResult.success).toBe(true);
      expect(deptResult.data.DeptName).toBe('IT');

      // Use department info to get related marcadas
      const marcadasResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, adminCtx);
      expect(marcadasResult.success).toBe(true);

      // Verify that the marcadas are related to the department
      if (marcadasResult.data && Array.isArray(marcadasResult.data) && marcadasResult.data.length > 0) {
        const firstMarcada = marcadasResult.data[0];
        if (firstMarcada && firstMarcada.Personal) {
          // The personal in the marcada should belong to the requested department
          expect(['IT']).toContain(firstMarcada.Personal.Departamento);
        }
      }
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle empty results gracefully', async () => {
      // Mock empty results
      mockDatabase.getDepartamentos.mockResolvedValueOnce([]);
      mockDatabase.getPersonal.mockResolvedValueOnce([]);
      mockDatabase.getUsuarios.mockResolvedValueOnce([]);
      mockDatabase.getMarcadasDelDia.mockResolvedValueOnce([]);

      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // All operations should handle empty results gracefully
      const deptResult = await tester.call('departamentos.getAll', undefined, ctx);
      expect(deptResult.success).toBe(true);
      expect(deptResult.data).toEqual([]);

      const personalResult = await tester.call('personal.getAll', undefined, ctx);
      expect(personalResult.success).toBe(true);
      expect(personalResult.data).toEqual([]);

      const usuariosResult = await tester.call('usuarios.getAll', undefined, ctx);
      expect(usuariosResult.success).toBe(true);
      expect(usuariosResult.data).toEqual([]);

      const marcadasResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, ctx);
      expect(marcadasResult.success).toBe(true);
      expect(marcadasResult.data).toEqual([]);
    });

    it('should handle large datasets efficiently', async () => {
      // Mock large datasets
      const largeDeptData = Array.from({ length: 1000 }, (_, i) => ({
        Deptid: i,
        DeptName: `Department ${i}`,
        SelloJefe: null,
        leyendaJefe: `Legend for department ${i}`
      }));
      
      mockDatabase.getDepartamentos.mockResolvedValueOnce(largeDeptData);

      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      const startTime = performance.now();
      const result = await tester.call('departamentos.getAll', undefined, ctx);
      const endTime = performance.now();

      // Should handle large dataset efficiently
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should handle 1000 records quickly
    });

    it('should properly handle error recovery scenarios', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // First, make a successful call
      const successResult = await tester.call('departamentos.getAll', undefined, ctx);
      expect(successResult.success).toBe(true);

      // Then simulate a database error
      mockDatabase.getDepartamentos.mockRejectedValueOnce(new Error('Database connection failed'));

      const errorResult = await tester.call('departamentos.getAll', undefined, ctx);
      expect(errorResult.success).toBe(false);
      expect(errorResult.code).toBe('INTERNAL_SERVER_ERROR');

      // Then make another successful call to ensure the system recovers
      mockDatabase.getDepartamentos.mockResolvedValueOnce(mockDepartamentos);
      const recoveryResult = await tester.call('departamentos.getAll', undefined, ctx);
      expect(recoveryResult.success).toBe(true);
      expect(recoveryResult.data).toEqual(mockDepartamentos);
    });
  });

  describe('Authentication Flow Tests', () => {
    it('should properly handle authentication flow with valid credentials', async () => {
      // Login with valid credentials
      const loginResult = await tester.call('usuarios.login', { 
        username: 'admin', 
        password: 'valid_password' 
      }, createMockContext());
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.data).toHaveProperty('WebUser');
      expect(loginResult.data).toHaveProperty('token');
      expect(loginResult.data.token).toBe('mock_jwt_token');

      // Use the authenticated context for protected operations
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Should be able to access protected endpoints
      const protectedResult = await tester.call('usuarios.getAll', undefined, ctx);
      expect(protectedResult.success).toBe(true);
    });

    it('should properly handle authentication flow with invalid credentials', async () => {
      // Login with invalid credentials
      const loginResult = await tester.call('usuarios.login', { 
        username: 'admin', 
        password: 'invalid_password' 
      }, createMockContext());
      
      // Login should return error object instead of throwing
      expect(loginResult.success).toBe(true);
      expect(loginResult.data).toEqual({ error: 'Credenciales incorrectas' });

      // Try to access protected endpoint without valid auth
      const ctx = createMockContext(); // No user context
      const protectedResult = await tester.call('usuarios.getAll', undefined, ctx);
      expect(protectedResult.success).toBe(false);
      expect(protectedResult.code).toBe('UNAUTHORIZED');
    });

    it('should enforce proper authorization after authentication', async () => {
      // Login as regular user
      const loginResult = await tester.call('usuarios.login', { 
        username: 'user1', 
        password: 'valid_password' 
      }, createMockContext());
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.data.WebUser.role).toBe('user');

      // Create context for the logged-in user
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Regular user should be able to access their own data
      const selfAccessResult = await tester.call('usuarios.getByUsername', { username: 'user1' }, userCtx);
      expect(selfAccessResult.success).toBe(true);

      // Regular user should NOT be able to access admin endpoints
      const adminAccessResult = await tester.call('usuarios.getAll', undefined, userCtx);
      expect(adminAccessResult.success).toBe(false);
      expect(adminAccessResult.code).toBe('UNAUTHORIZED');

      // Regular user should NOT be able to access other users' data
      const otherUserAccessResult = await tester.call('usuarios.getByUsername', { username: 'admin' }, userCtx);
      expect(otherUserAccessResult.success).toBe(false);
      expect(otherUserAccessResult.code).toBe('UNAUTHORIZED');
    });
 });

  describe('Complete Business Workflow', () => {
    it('should handle a complete business workflow for employee time tracking', async () => {
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Step 1: Create a new employee
      const createPersonalResult = await tester.call('personal.create', { 
        MR: '003', 
        Nombre: 'Jane Employee', 
        Departamento: 'IT',
        CUIL: '27-12345678-9',
        Jornada: 'Full-time',
        Activo: true,
        Foto: ''
      }, adminCtx);
      
      expect(createPersonalResult.success).toBe(true);
      expect(createPersonalResult.data.Nombre).toBe('Jane Employee');

      // Step 2: Update the employee's information
      const updatePersonalResult = await tester.call('personal.update', { 
        UID: createPersonalResult.data.UID, 
        Jornada: 'Part-time' 
      }, adminCtx);
      
      expect(updatePersonalResult.success).toBe(true);

      // Step 3: Get the updated employee information
      const getPersonalResult = await tester.call('personal.getById', { 
        UID: createPersonalResult.data.UID 
      }, adminCtx);
      
      expect(getPersonalResult.success).toBe(true);
      expect(getPersonalResult.data.Nombre).toBe('Jane Employee');
      expect(getPersonalResult.data.Jornada).toBe('Part-time');

      // Step 4: Get marcadas for the employee's department
      const marcadasResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, adminCtx);
      
      expect(marcadasResult.success).toBe(true);
      expect(Array.isArray(marcadasResult.data)).toBe(true);

      // Step 5: Get standard marcadas report
      const estandarResult = await tester.call('marcadas.getEstandar', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, adminCtx);
      
      expect(estandarResult.success).toBe(true);
      expect(Array.isArray(estandarResult.data)).toBe(true);

      // Step 6: Get marcadas between dates
      const entreFechasResult = await tester.call('marcadas.getEntreFechas', { 
        departamento: 'IT', 
        fechaInicial: '2023-01-01', 
        fechaFinal: '2023-01-31' 
      }, adminCtx);
      
      expect(entreFechasResult.success).toBe(true);
      expect(Array.isArray(entreFechasResult.data)).toBe(true);
    });
  });
});