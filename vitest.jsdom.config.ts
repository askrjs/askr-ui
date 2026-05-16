import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'jsdom',
    include: [
      'tests/jsdom/components/button/**/*.test.tsx',
      'tests/jsdom/components/icon/**/*.test.tsx',
      'tests/jsdom/components/consistency-reset/**/*.test.tsx',
    ],
  },
});
