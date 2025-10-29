import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['tests/**/*.test.{ts,js}'],
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    globals: true,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true
  },
  resolve: {
    alias: {
      '$lib': './src/lib',
      '$app': './src/app'
    }
  }
});