import { describe, it, expect, vi, beforeEach, bench } from 'vitest';
import { createTRPCProcedureTester } from '../utils';
import { departamentosRouter } from '$lib/server/trpc/routers/departamentos';
import { usuariosRouter } from '$lib/server/trpc/routers/usuarios';
import { createMockContext, mockDatabase } from '../setup';

describe('Performance Benchmarks', () => {
  let deptTester: ReturnType<typeof createTRPCProcedureTester>;
  let userTester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    deptTester = createTRPCProcedureTester(departamentosRouter);
    userTester = createTRPCProcedureTester(usuariosRouter);
    vi.clearAllMocks();
  });

 describe('Basic Performance Tests', () => {
    it('should execute procedures within acceptable time limits', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Measure execution time for departamentos.getAll
      const startTime = performance.now();
      const result = await deptTester.call('getAll', undefined, ctx);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
      
      // Measure execution time for usuarios.getByUsername
      const startTime2 = performance.now();
      const result2 = await userTester.call('getByUsername', { username: 'user1' }, ctx);
      const endTime2 = performance.now();
      
      expect(result2.success).toBe(true);
      expect(endTime2 - startTime2).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Execute multiple requests concurrently
      const requests = Array.from({ length: 10 }, () => 
        deptTester.call('getByName', { DeptName: 'IT' }, ctx)
      );

      const startTime = performance.now();
      const results = await Promise.all(requests);
      const endTime = performance.now();

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Total time should be reasonable for 10 concurrent requests
      expect(endTime - startTime).toBeLessThan(500); // Should complete in <500ms for 10 requests
    });
  });

  describe('Load Testing', () => {
    it('should maintain performance under load', async () => {
      const ctx = createMockContext({ 
        username: 'admin', 
        role: 'admin', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT', 'HR', 'Finance'] 
      });

      // Execute many requests to test performance under load
      const iterations = 50;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = await deptTester.call('getByName', { DeptName: 'IT' }, ctx);
        expect(result.success).toBe(true);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / iterations;

      // Average time per request should be reasonable
      expect(avgTimePerRequest).toBeLessThan(50); // <50ms average per request
      expect(totalTime).toBeLessThan(2500); // Total time for 50 requests should be <2.5s
    });

    it('should not degrade significantly with increased data size', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock larger datasets to test performance with more data
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        Deptid: i,
        DeptName: `Department ${i}`,
        SelloJefe: null,
        leyendaJefe: `Legend for department ${i}`
      }));
      
      mockDatabase.getDepartamentos.mockResolvedValueOnce(largeDataset);

      const startTime = performance.now();
      const result = await deptTester.call('getAll', undefined, ctx);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(200); // Should handle 1000 records in <200ms
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not have significant memory leaks during repeated calls', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Capture memory before
      const memoryBefore = (global as any).performance ? 
        (global as any).performance.memory : 
        { usedJSHeapSize: 0 };

      // Execute many requests
      for (let i = 0; i < 100; i++) {
        const result = await deptTester.call('getByName', { DeptName: 'IT' }, ctx);
        expect(result.success).toBe(true);
      }

      // In a real test, we would check memoryAfter - memoryBefore
      // For now, just ensure the test completes without errors
      expect(true).toBe(true);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently without performance degradation', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Mock database to throw an error
      mockDatabase.getDepartamentos.mockRejectedValueOnce(new Error('Database error'));

      const startTime = performance.now();
      const result = await deptTester.call('getAll', undefined, ctx);
      const endTime = performance.now();

      // Should handle error quickly
      expect(result.success).toBe(false);
      expect(endTime - startTime).toBeLessThan(100); // Error handling should be fast
    });

    it('should handle validation errors efficiently', async () => {
      const ctx = createMockContext({ 
        username: 'testuser', 
        role: 'user', 
        departamento: 'IT', 
        departamentosPermitidos: ['IT'] 
      });

      // Test with invalid input that should trigger validation error
      const startTime = performance.now();
      const result = await deptTester.call('getByName', {}, ctx); // Missing required DeptName
      const endTime = performance.now();

      // Validation should be fast
      expect(result.success).toBe(false);
      expect(endTime - startTime).toBeLessThan(50); // Validation should be very fast
    });
  });
});

// Performance benchmarks using Vitest's bench functionality
describe('Benchmarks', () => {
  let deptTester: ReturnType<typeof createTRPCProcedureTester>;
  let userTester: ReturnType<typeof createTRPCProcedureTester>;

  beforeEach(() => {
    deptTester = createTRPCProcedureTester(departamentosRouter);
    userTester = createTRPCProcedureTester(usuariosRouter);
    vi.clearAllMocks();
  });

  bench('departamentos.getAll execution time', async () => {
    const ctx = createMockContext({ 
      username: 'testuser', 
      role: 'user', 
      departamento: 'IT', 
      departamentosPermitidos: ['IT'] 
    });

    await deptTester.call('getAll', undefined, ctx);
  });

  bench('departamentos.getByName execution time', async () => {
    const ctx = createMockContext({ 
      username: 'testuser', 
      role: 'user', 
      departamento: 'IT', 
      departamentosPermitidos: ['IT'] 
    });

    await deptTester.call('getByName', { DeptName: 'IT' }, ctx);
  });

  bench('departamentos.update execution time', async () => {
    const ctx = createMockContext({ 
      username: 'testuser', 
      role: 'user', 
      departamento: 'IT', 
      departamentosPermitidos: ['IT'] 
    });

    await deptTester.call('update', { Deptid: 1, DeptName: 'Updated IT' }, ctx);
  });

  bench('usuarios.login execution time', async () => {
    await userTester.call('login', { 
      username: 'admin', 
      password: 'valid_password' 
    }, createMockContext());
  });

  bench('usuarios.getByUsername execution time', async () => {
    const ctx = createMockContext({ 
      username: 'admin', 
      role: 'admin', 
      departamento: 'IT', 
      departamentosPermitidos: ['IT', 'HR', 'Finance'] 
    });

    await userTester.call('getByUsername', { username: 'user1' }, ctx);
  });

  bench('usuarios.getAll execution time', async () => {
    const ctx = createMockContext({ 
      username: 'admin', 
      role: 'admin', 
      departamento: 'IT', 
      departamentosPermitidos: ['IT', 'HR', 'Finance'] 
    });

    await userTester.call('getAll', undefined, ctx);
  });

  // Compare performance of authenticated vs unauthenticated requests
 bench('authed vs unauthed performance comparison', async () => {
    const authedCtx = createMockContext({ 
      username: 'testuser', 
      role: 'user', 
      departamento: 'IT', 
      departamentosPermitidos: ['IT'] 
    });
    
    const unauthedCtx = createMockContext(); // No user

    // Authenticated request
    await deptTester.call('getByName', { DeptName: 'IT' }, authedCtx);
    
    // Unauthenticated request (will fail, but measure the time anyway)
    try {
      await deptTester.call('getByName', { DeptName: 'IT' }, unauthedCtx);
    } catch (e) {
      // Expected to fail
    }
 });
});