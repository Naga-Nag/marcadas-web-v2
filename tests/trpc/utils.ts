import { vi } from 'vitest';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from '$lib/server/trpc/router';
import type { HTTPResponse } from '@trpc/server/http';
import { mockDatabase } from './setup';
import { TRPCError } from '@trpc/server';
import { router as trpcRouter } from '$lib/server/trpc/init';

// Mock the tRPC client for testing
export const createMockTRPCClient = (user?: any) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      () =>
        ({ op, next }) => {
          return next(op).then((result) => {
            // Mock the response based on the operation
            if (op.path === 'departamentos.getAll') {
              return Promise.resolve({
                result: { data: mockDatabase.getDepartamentos() }
              } as any);
            }
            if (op.path === 'departamentos.getByName') {
              const deptName = op.input?.DeptName;
              return Promise.resolve({
                result: { data: mockDatabase.getDepartamentoByName(deptName) }
              } as any);
            }
            if (op.path === 'departamentos.update') {
              return Promise.resolve({
                result: { data: { success: true, message: 'Departamento updated successfully' } }
              } as any);
            }
            if (op.path === 'personal.getAll') {
              return Promise.resolve({
                result: { data: mockDatabase.getPersonal() }
              } as any);
            }
            if (op.path === 'personal.getById') {
              const uid = op.input?.UID;
              return Promise.resolve({
                result: { data: mockDatabase.getPersonalById(uid) }
              } as any);
            }
            if (op.path === 'personal.create') {
              return Promise.resolve({
                result: { data: mockDatabase.createPersonal(op.input) }
              } as any);
            }
            if (op.path === 'personal.update') {
              return Promise.resolve({
                result: { data: { success: true, message: 'Personal updated successfully' } }
              } as any);
            }
            if (op.path === 'usuarios.getAll') {
              return Promise.resolve({
                result: { data: mockDatabase.getUsuarios() }
              } as any);
            }
            if (op.path === 'usuarios.getByUsername') {
              const username = op.input?.username;
              return Promise.resolve({
                result: { data: mockDatabase.getUsuario(username) }
              } as any);
            }
            if (op.path === 'usuarios.login') {
              const { username, password } = op.input;
              return Promise.resolve({
                result: { data: mockDatabase.loginWebUser(username, password) }
              } as any);
            }
            if (op.path === 'usuarios.create') {
              return Promise.resolve({
                result: { data: { success: true, message: 'Usuario created successfully' } }
              } as any);
            }
            if (op.path === 'usuarios.update') {
              return Promise.resolve({
                result: { data: { success: true, message: 'Usuario updated successfully' } }
              } as any);
            }
            if (op.path === 'usuarios.delete') {
              return Promise.resolve({
                result: { data: { success: true, message: 'Usuario deleted successfully' } }
              } as any);
            }
            if (op.path === 'marcadas.getDelDia') {
              return Promise.resolve({
                result: { data: mockDatabase.getMarcadasDelDia() }
              } as any);
            }
            if (op.path === 'marcadas.getEstandar') {
              return Promise.resolve({
                result: { data: mockDatabase.getMarcadasEstandar() }
              } as any);
            }
            if (op.path === 'marcadas.getEntreFechas') {
              return Promise.resolve({
                result: { data: mockDatabase.getMarcadasEntreFechas() }
              } as any);
            }
            
            // Default response for unhandled operations
            return result;
          });
        }
    ]
  });
};

// Create a test utility for handling tRPC procedures directly
// This properly executes tRPC procedures with their middleware chains
export const createTRPCProcedureTester = (router: any) => {
  return {
    call: async (procedureName: string, input: any = undefined, ctx: any = {}) => {
      // For individual routers, we directly access the procedure
      if (!router._def || !router._def.procedures) {
        throw new Error('Invalid router provided');
      }
      
      const procedure = router._def.procedures[procedureName];
      if (!procedure) {
        throw new Error(`Procedure ${procedureName} not found in router`);
      }
      
      try {
        // Execute the tRPC procedure call with proper middleware execution
        // We need to properly execute the procedure with its middleware chain
        const result = await procedure({
          input: input,
          ctx: ctx,
          type: procedure._def.type,
          path: procedureName,
          rawInput: input,
        });
        
        return { success: true, data: result };
      } catch (error: any) {
        // Return error details in a consistent format
        return {
          success: false,
          error: error.message,
          code: error.code || (error instanceof TRPCError ? error.code : undefined)
        };
      }
    }
  };
};

// Utility for testing error cases
export const expectTRPCError = async (asyncFn: () => Promise<any>, expectedCode: string, expectedMessage?: string) => {
  try {
    await asyncFn();
    throw new Error('Expected TRPCError but none was thrown');
  } catch (error: any) {
    if (error.code !== expectedCode) {
      throw new Error(`Expected error code ${expectedCode}, got ${error.code}`);
    }
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
    }
    return error;
 }
};

// Utility for testing input validation
export const testInputValidation = (schema: any, validInput: any, invalidInputs: any[]) => {
  // Test valid input
  expect(() => schema.parse(validInput)).not.toThrow();
  
  // Test invalid inputs
  invalidInputs.forEach((invalidInput, index) => {
    expect(() => schema.parse(invalidInput)).toThrow();
  });
};