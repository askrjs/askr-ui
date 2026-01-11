import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@askrjs/askr',
  },
  resolve: {
    alias: {},
  },
});
