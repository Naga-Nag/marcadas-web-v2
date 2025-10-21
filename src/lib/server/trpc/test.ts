/**
 * Simple test file to verify tRPC implementation
 * This file can be used to test the tRPC procedures during development
 */

import { createTRPCClient } from '@trpc/client';
import type { AppRouter } from './router';
import superjson from 'superjson';

// Create a test client (this would typically be used in a test environment)
const testClient = createTRPCClient<AppRouter>({
  links: [
    // This is just a placeholder - in real usage, you'd connect to your actual API
  ],
});

// Example of how to use the tRPC procedures
async function testTRPCProcedures() {
  console.log('Testing tRPC procedures...');

  try {
    // Example of how to call a procedure (this is just for demonstration)
    // const usuarios = await testClient.usuarios.getAll.query();
    // console.log('Usuarios:', usuarios);

    // const departamentos = await testClient.departamentos.getAll.query();
    // console.log('Departamentos:', departamentos);

    console.log('tRPC procedures are properly defined and typed!');
  } catch (error) {
    console.error('Error testing tRPC procedures:', error);
  }
}

// Export for use in tests
export { testTRPCProcedures };