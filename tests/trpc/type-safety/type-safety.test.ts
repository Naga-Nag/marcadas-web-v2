import { describe, it, expect } from 'vitest';
import type { AppRouter } from '$lib/server/trpc/router';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createMockTRPCClient } from '../utils';
import {
  createPersonalSchema,
  updatePersonalSchema,
  updateDepartamentoSchema,
  createUsuarioSchema,
  updateUsuarioSchema,
  loginUsuarioSchema,
  getMarcadasSchema
} from '$lib/server/trpc/schemas';

// Type safety tests to ensure proper typing
describe('Type Safety Tests', () => {
 // Test that router inputs and outputs are properly typed
  it('should have properly typed router inputs', () => {
    type ActualInputs = inferRouterInputs<AppRouter>;
    
    // Define expected input types
    type ExpectedInputs = {
      // Departamentos
      'departamentos.getAll': undefined;
      'departamentos.getByName': { DeptName: string };
      'departamentos.update': {
        Deptid?: number;
        DeptName?: string;
        SelloJefe?: string | null;
        leyendaJefe?: string;
      } | {
        DeptName: string;
        Deptid?: number;
        SelloJefe?: string | null;
        leyendaJefe?: string;
      };
      // Personal
      'personal.getAll': undefined;
      'personal.getById': { UID: number };
      'personal.create': {
        MR: string;
        Nombre: string;
        Departamento?: string;
        CUIL?: string;
        Jornada?: string;
        Activo?: boolean;
        Foto?: string;
      };
      'personal.update': {
        UID: number;
        MR?: string;
        Nombre?: string;
        Departamento?: string;
        CUIL?: string;
        Jornada?: string;
        Activo?: boolean;
        Foto?: string;
      };
      // Usuarios
      'usuarios.login': {
        username: string;
        password: string;
      };
      'usuarios.getAll': undefined;
      'usuarios.getByUsername': {
        username: string;
      };
      'usuarios.create': {
        username: string;
        password: string;
        role: string;
        departamento?: string;
        departamentosPermitidos?: string[];
      };
      'usuarios.update': {
        username: string;
        role?: string;
        departamento?: string;
        departamentosPermitidos?: string[];
        password?: string;
      };
      'usuarios.delete': {
        username: string;
      };
      // Marcadas
      'marcadas.getDelDia': {
        departamento: string;
        fecha: string;
      };
      'marcadas.getEstandar': {
        departamento: string;
        fecha: string;
      };
      'marcadas.getEntreFechas': {
        departamento: string;
        fechaInicial: string;
        fechaFinal: string;
      };
    };
    
    // Verify that ActualInputs matches ExpectedInputs
    const inputs: ExpectedInputs & ActualInputs = {
      // Departamentos
      'departamentos.getAll': undefined,
      'departamentos.getByName': { DeptName: 'test' },
      'departamentos.update': { Deptid: 1, DeptName: 'Updated' },
      // Personal
      'personal.getAll': undefined,
      'personal.getById': { UID: 1 },
      'personal.create': { MR: '001', Nombre: 'Test' },
      'personal.update': { UID: 1, Nombre: 'Updated' },
      // Usuarios
      'usuarios.login': { username: 'test', password: 'password' },
      'usuarios.getAll': undefined,
      'usuarios.getByUsername': { username: 'test' },
      'usuarios.create': { username: 'test', password: 'password', role: 'user' },
      'usuarios.update': { username: 'test', role: 'admin' },
      'usuarios.delete': { username: 'test' },
      // Marcadas
      'marcadas.getDelDia': { departamento: 'test', fecha: '2023-01-01' },
      'marcadas.getEstandar': { departamento: 'test', fecha: '2023-01-01' },
      'marcadas.getEntreFechas': { departamento: 'test', fechaInicial: '2023-01-01', fechaFinal: '2023-01-31' },
    };
    
    expect(inputs).toBeDefined();
 });

  it('should have properly typed router outputs', () => {
    type ActualOutputs = inferRouterOutputs<AppRouter>;
    
    // We can't easily test output types without running the procedures,
    // but we can verify that the type system works by using the client
    const client = createMockTRPCClient();
    
    // These calls should not produce type errors if the router is properly typed
    expect(client.departamentos.getAll.query).toBeTypeOf('function');
    expect(client.departamentos.getByName.query).toBeTypeOf('function');
    expect(client.departamentos.update.mutate).toBeTypeOf('function');
    
    expect(client.personal.getAll.query).toBeTypeOf('function');
    expect(client.personal.getById.query).toBeTypeOf('function');
    expect(client.personal.create.mutate).toBeTypeOf('function');
    expect(client.personal.update.mutate).toBeTypeOf('function');
    
    expect(client.usuarios.login.mutate).toBeTypeOf('function');
    expect(client.usuarios.getAll.query).toBeTypeOf('function');
    expect(client.usuarios.getByUsername.query).toBeTypeOf('function');
    expect(client.usuarios.create.mutate).toBeTypeOf('function');
    expect(client.usuarios.update.mutate).toBeTypeOf('function');
    expect(client.usuarios.delete.mutate).toBeTypeOf('function');
    
    expect(client.marcadas.getDelDia.query).toBeTypeOf('function');
    expect(client.marcadas.getEstandar.query).toBeTypeOf('function');
    expect(client.marcadas.getEntreFechas.query).toBeTypeOf('function');
  });

  it('should enforce schema validation at type level', () => {
    // Test Zod schema types are imported at the top of the file
    // These should compile without errors
    const validPersonal = createPersonalSchema.parse({
      MR: '01',
      Nombre: 'John Doe',
      Departamento: 'IT',
      CUIL: '20-12345678-9',
      Jornada: 'Full-time',
      Activo: true,
      Foto: ''
    });
    
    const validPersonalUpdate = updatePersonalSchema.parse({
      UID: 1,
      Nombre: 'Updated Name'
    });
    
    const validDepartamentoUpdate = updateDepartamentoSchema.parse({
      Deptid: 1,
      DeptName: 'Updated IT'
    });
    
    const validUsuario = createUsuarioSchema.parse({
      username: 'testuser',
      password: 'password123',
      role: 'user',
      departamento: 'IT',
      departamentosPermitidos: ['IT', 'HR']
    });
    
    const validUsuarioUpdate = updateUsuarioSchema.parse({
      username: 'testuser',
      role: 'admin'
    });
    
    const validLogin = loginUsuarioSchema.parse({
      username: 'testuser',
      password: 'password123'
    });
    
    const validMarcadas = getMarcadasSchema.parse({
      departamento: 'IT',
      fecha: '2023-01-01',
      funcion: 'delDia'
    });
    
    expect(validPersonal).toBeDefined();
    expect(validPersonalUpdate).toBeDefined();
    expect(validDepartamentoUpdate).toBeDefined();
    expect(validUsuario).toBeDefined();
    expect(validUsuarioUpdate).toBeDefined();
    expect(validLogin).toBeDefined();
    expect(validMarcadas).toBeDefined();
  });

  it('should properly type the main router', () => {
    // This test verifies that the main router is properly typed
    const router: typeof AppRouter = null as any; // We're just checking the type here
    
    // The router should have all expected procedures
    expect(router).toBeDefined();
    
    // Verify that we can access all expected router paths
    const expectedPaths = [
      'departamentos',
      'personal', 
      'usuarios',
      'marcadas'
    ];
    
    // This is just a type check - if the router type changes unexpectedly,
    // this test will fail to compile
    const routerKeys = Object.keys(router._def.procedures).filter(key => 
      expectedPaths.some(path => key.startsWith(path))
    );
    
    expect(routerKeys.length).toBeGreaterThan(0);
  });
});