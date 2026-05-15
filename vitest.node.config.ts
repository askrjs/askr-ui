import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'node',
    include: [
      'tests/bench-contract.test.ts',
      'tests/foundations-contract.test.ts',
      'tests/source-layout.test.ts',
      'tests/public-api.test.ts',
      'tests/export-map.test.ts',
      'tests/docs-contract.test.ts',
    ],
  },
});
