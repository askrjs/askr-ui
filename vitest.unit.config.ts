import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'node',
    include: [
      'tests/unit/bench-contract.test.ts',
      'tests/unit/browser-bench-contract.test.ts',
      'tests/unit/foundations-contract.test.ts',
      'tests/unit/source-layout.test.ts',
      'tests/unit/public-api.test.ts',
      'tests/unit/export-map.test.ts',
      'tests/unit/docs-contract.test.ts',
    ],
  },
});
