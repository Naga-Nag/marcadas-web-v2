import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appRouter } from '$lib/server/trpc/router';
import { createMockContext, mockDatabase, mockUsuarios, mockDepartamentos, mockPersonal, mockMarcadas } from '../setup';
import { createTRPCProcedureTester } from '../utils';

describe('tRPC Integration Tests - Full Request-Response Cycles', () => {
  let tester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    tester = createTRPCProcedureTester(appRouter);
    vi.clearAllMocks();
  });

  describe('Departamentos Integration Tests', () => {
    it('should handle complete departamento workflow', async () => {
      // Authenticate as admin user
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Get all departamentos
      const getAllResult = await tester.call('departamentos.getAll', undefined, ctx);
      expect(getAllResult.success).toBe(true);
      expect(getAllResult.data).toEqual(mockDatabase.getDepartamentos());

      // Get specific departamento by name
      const getByNameResult = await tester.call('departamentos.getByName', { DeptName: 'IT' }, ctx);
      expect(getByNameResult.success).toBe(true);
      expect(getByNameResult.data).toEqual(mockDepartamentos[0]);

      // Update departamento
      const updateResult = await tester.call('departamentos.update', { 
        Deptid: 1, 
        DeptName: 'Updated IT', 
        leyendaJefe: 'Updated IT Department' 
      }, ctx);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data).toEqual({ 
        success: true, 
        message: 'Departamento updated successfully' 
      });
    });

    it('should handle unauthorized access to departamento procedures', async () => {
      const ctx = createMockContext(); // Unauthenticated user

      // Try to get all departamentos
      const getAllResult = await tester.call('departamentos.getAll', undefined, ctx);
      expect(getAllResult.success).toBe(false);
      expect(getAllResult.code).toBe('UNAUTHORIZED');

      // Try to get departamento by name
      const getByNameResult = await tester.call('departamentos.getByName', { DeptName: 'IT' }, ctx);
      expect(getByNameResult.success).toBe(false);
      expect(getByNameResult.code).toBe('UNAUTHORIZED');

      // Try to update departamento
      const updateResult = await tester.call('departamentos.update', { Deptid: 1, DeptName: 'Updated IT' }, ctx);
      expect(updateResult.success).toBe(false);
      expect(updateResult.code).toBe('UNAUTHORIZED');
    });
 });

  describe('Personal Integration Tests', () => {
    it('should handle complete personal workflow', async () => {
      // Authenticate as admin user
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Get all personal
      const getAllResult = await tester.call('personal.getAll', undefined, ctx);
      expect(getAllResult.success).toBe(true);
      expect(getAllResult.data).toEqual(mockDatabase.getPersonal());

      // Get specific personal by ID
      const getByIdResult = await tester.call('personal.getById', { UID: 1 }, ctx);
      expect(getByIdResult.success).toBe(true);
      expect(getByIdResult.data).toEqual(mockPersonal[0]);

      // Create new personal
      const createResult = await tester.call('personal.create', { 
        MR: '003', 
        Nombre: 'Bob Johnson', 
        Departamento: 'HR',
        CUIL: '20-111111-1',
        Jornada: 'Part-time',
        Activo: true,
        Foto: ''
      }, ctx);
      expect(createResult.success).toBe(true);
      expect(createResult.data).toEqual({
        UID: 99,
        MR: 3, // Should convert string to number
        Nombre: 'Bob Johnson',
        Departamento: 'HR',
        CUIL: '20-1111111-1',
        Jornada: 'Part-time',
        Activo: '1', // Should convert boolean to string
        Foto: ''
      });

      // Update personal
      const updateResult = await tester.call('personal.update', { 
        UID: 1, 
        Nombre: 'Updated Name' 
      }, ctx);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data).toEqual({ 
        success: true, 
        message: 'Personal updated successfully' 
      });
    });

    it('should handle unauthorized access to personal procedures', async () => {
      const ctx = createMockContext(); // Unauthenticated user

      // Try to get all personal
      const getAllResult = await tester.call('personal.getAll', undefined, ctx);
      expect(getAllResult.success).toBe(false);
      expect(getAllResult.code).toBe('UNAUTHORIZED');

      // Try to get personal by ID
      const getByIdResult = await tester.call('personal.getById', { UID: 1 }, ctx);
      expect(getByIdResult.success).toBe(false);
      expect(getByIdResult.code).toBe('UNAUTHORIZED');

      // Try to create personal
      const createResult = await tester.call('personal.create', { 
        MR: '003', 
        Nombre: 'Bob Johnson' 
      }, ctx);
      expect(createResult.success).toBe(false);
      expect(createResult.code).toBe('UNAUTHORIZED');

      // Try to update personal
      const updateResult = await tester.call('personal.update', { UID: 1, Nombre: 'Updated Name' }, ctx);
      expect(updateResult.success).toBe(false);
      expect(updateResult.code).toBe('UNAUTHORIZED');
    });
 });

  describe('Usuarios Integration Tests', () => {
    it('should handle complete usuarios workflow for admin', async () => {
      // Authenticate as admin user
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Get all usuarios
      const getAllResult = await tester.call('usuarios.getAll', undefined, adminCtx);
      expect(getAllResult.success).toBe(true);
      expect(getAllResult.data).toEqual(mockDatabase.getUsuarios());

      // Get specific usuario by username
      const getByUsernameResult = await tester.call('usuarios.getByUsername', { username: 'user1' }, adminCtx);
      expect(getByUsernameResult.success).toBe(true);
      expect(getByUsernameResult.data).toEqual(mockUsuarios[1]);

      // Create new usuario
      const createResult = await tester.call('usuarios.create', { 
        username: 'newuser', 
        password: 'newpassword123', 
        role: 'user',
        departamento: 'HR',
        departamentosPermitidos: ['HR']
      }, adminCtx);
      expect(createResult.success).toBe(true);
      expect(createResult.data).toEqual({ 
        success: true, 
        message: 'Usuario created successfully' 
      });

      // Update usuario
      const updateResult = await tester.call('usuarios.update', { 
        username: 'user1', 
        role: 'admin' 
      }, adminCtx);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data).toEqual({ 
        success: true, 
        message: 'Usuario updated successfully' 
      });

      // Delete usuario
      const deleteResult = await tester.call('usuarios.delete', { username: 'newuser' }, adminCtx);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data).toEqual({ 
        success: true, 
        message: 'Usuario deleted successfully' 
      });
    });

    it('should handle user self-management workflow', async () => {
      // Authenticate as regular user
      const userCtx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Get own user info
      const getByUsernameResult = await tester.call('usuarios.getByUsername', { username: 'user1' }, userCtx);
      expect(getByUsernameResult.success).toBe(true);
      expect(getByUsernameResult.data).toEqual(mockUsuarios[1]);

      // Update own info
      const updateResult = await tester.call('usuarios.update', { 
        username: 'user1', 
        role: 'superuser' 
      }, userCtx);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data).toEqual({ 
        success: true, 
        message: 'Usuario updated successfully' 
      });
    });

    it('should handle unauthorized access to usuarios procedures', async () => {
      const ctx = createMockContext(); // Unauthenticated user

      // Try to get all usuarios (admin only)
      const getAllResult = await tester.call('usuarios.getAll', undefined, ctx);
      expect(getAllResult.success).toBe(false);
      expect(getAllResult.code).toBe('UNAUTHORIZED');

      // Try to get usuario by username
      const getByUsernameResult = await tester.call('usuarios.getByUsername', { username: 'user1' }, ctx);
      expect(getByUsernameResult.success).toBe(false);
      expect(getByUsernameResult.code).toBe('UNAUTHORIZED');

      // Try to create usuario (admin only)
      const createResult = await tester.call('usuarios.create', { 
        username: 'newuser', 
        password: 'newpassword123', 
        role: 'user' 
      }, ctx);
      expect(createResult.success).toBe(false);
      expect(createResult.code).toBe('UNAUTHORIZED');

      // Try to update usuario
      const updateResult = await tester.call('usuarios.update', { username: 'user1', role: 'admin' }, ctx);
      expect(updateResult.success).toBe(false);
      expect(updateResult.code).toBe('UNAUTHORIZED');

      // Try to delete usuario (admin only)
      const deleteResult = await tester.call('usuarios.delete', { username: 'user1' }, ctx);
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.code).toBe('UNAUTHORIZED');
    });

    it('should handle login procedure', async () => {
      // Test successful login
      const loginResult = await tester.call('usuarios.login', { 
        username: 'admin', 
        password: 'valid_password' 
      }, createMockContext());
      expect(loginResult.success).toBe(true);
      expect(loginResult.data).toEqual({
        WebUser: mockUsuarios[0],
        token: 'mock_jwt_token'
      });

      // Test failed login
      const failedLoginResult = await tester.call('usuarios.login', { 
        username: 'admin', 
        password: 'invalid_password' 
      }, createMockContext());
      expect(failedLoginResult.success).toBe(true); // Login returns error object instead of throwing
      expect(failedLoginResult.data).toEqual({ error: 'Credenciales incorrectas' });
    });
  });

  describe('Marcadas Integration Tests', () => {
    it('should handle complete marcadas workflow', async () => {
      // Authenticate as user
      const ctx = createMockContext({ 
        username: 'user1', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Get marcadas del día
      const getDelDiaResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, ctx);
      expect(getDelDiaResult.success).toBe(true);
      expect(getDelDiaResult.data).toEqual(mockDatabase.getMarcadasDelDia());

      // Get marcadas estándar
      const getEstandarResult = await tester.call('marcadas.getEstandar', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, ctx);
      expect(getEstandarResult.success).toBe(true);
      expect(getEstandarResult.data).toEqual(mockDatabase.getMarcadasEstandar());

      // Get marcadas entre fechas
      const getEntreFechasResult = await tester.call('marcadas.getEntreFechas', { 
        departamento: 'IT', 
        fechaInicial: '2023-01-01', 
        fechaFinal: '2023-01-31' 
      }, ctx);
      expect(getEntreFechasResult.success).toBe(true);
      expect(getEntreFechasResult.data).toEqual(mockDatabase.getMarcadasEntreFechas());
    });

    it('should handle unauthorized access to marcadas procedures', async () => {
      const ctx = createMockContext(); // Unauthenticated user

      // Try to get marcadas del día
      const getDelDiaResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, ctx);
      expect(getDelDiaResult.success).toBe(false);
      expect(getDelDiaResult.code).toBe('UNAUTHORIZED');

      // Try to get marcadas estándar
      const getEstandarResult = await tester.call('marcadas.getEstandar', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, ctx);
      expect(getEstandarResult.success).toBe(false);
      expect(getEstandarResult.code).toBe('UNAUTHORIZED');

      // Try to get marcadas entre fechas
      const getEntreFechasResult = await tester.call('marcadas.getEntreFechas', { 
        departamento: 'IT', 
        fechaInicial: '2023-01-01', 
        fechaFinal: '2023-01-31' 
      }, ctx);
      expect(getEntreFechasResult.success).toBe(false);
      expect(getEntreFechasResult.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Cross-Module Integration Tests', () => {
    it('should handle workflows that span multiple modules', async () => {
      // Authenticate as admin user
      const adminCtx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Get all departamentos
      const departamentosResult = await tester.call('departamentos.getAll', undefined, adminCtx);
      expect(departamentosResult.success).toBe(true);
      expect(departamentosResult.data.length).toBeGreaterThan(0);

      // Get all personal
      const personalResult = await tester.call('personal.getAll', undefined, adminCtx);
      expect(personalResult.success).toBe(true);
      expect(personalResult.data.length).toBeGreaterThan(0);

      // Get marcadas for one of the departments
      const marcadasResult = await tester.call('marcadas.getDelDia', { 
        departamento: 'IT', 
        fecha: '2023-01-01' 
      }, adminCtx);
      expect(marcadasResult.success).toBe(true);
      expect(marcadasResult.data).toEqual(mockDatabase.getMarcadasDelDia());
    });
  });
});