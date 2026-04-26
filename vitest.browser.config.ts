import { playwright } from 'vite-plus/test/browser-playwright';
import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    setupFiles: [
      ...(sharedVitestConfig.test?.setupFiles ?? []),
      './tests/browser-console.setup.ts',
    ],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    include: [
      'tests/components/*/behavior.test.tsx',
      'tests/components/*/a11y.test.tsx',
      'tests/components/*/determinism.test.tsx',
    ],
    exclude: [
      'tests/components/icon/**',
      'tests/components/nav-link/behavior.test.tsx',
    ],
  },
});
