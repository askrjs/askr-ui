import { askr } from '@askrjs/vite';
import { defineConfig } from 'vite-plus';
import { fileURLToPath } from 'node:url';

const foundationsAlias = fileURLToPath(
  new URL('./src/foundations/index.ts', import.meta.url)
);

export const sharedVitestConfig = defineConfig({
  plugins: [askr()],
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: '@askrjs/askr',
    },
    jsxInject:
      "import { jsx, jsxs, Fragment } from '@askrjs/askr/jsx-runtime';",
  },
  resolve: {
    alias: {
      '@askrjs/askr/for': '@askrjs/askr/control',
      '@askrjs/ui/foundations': foundationsAlias,
    },
    preserveSymlinks: true,
  },
});

