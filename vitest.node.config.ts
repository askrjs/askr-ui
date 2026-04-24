import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'node',
    include: ['tests/public-api.test.ts', 'tests/docs-contract.test.ts'],
  },
});
