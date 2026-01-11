import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['benches/**/*.bench.ts', 'benches/**/*.bench.tsx'],
    benchmark: {
      include: ['benches/**/*.bench.ts', 'benches/**/*.bench.tsx'],
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@askrjs/askr',
  },
  resolve: {
    alias: {},
  },
});
