import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'jsdom',
    include: [
      'tests/components/icon/**/*.test.tsx',
      'tests/components/consistency-reset/**/*.test.tsx',
      'tests/components/data-table/state.test.tsx',
    ],
  },
});
