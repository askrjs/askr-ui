import { playwright } from 'vite-plus/test/browser-playwright';
import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.test.shared';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    setupFiles: [
      ...(sharedVitestConfig.test?.setupFiles ?? []),
      './tests/browser/browser-console.setup.ts',
    ],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      api: {
        host: '127.0.0.1',
        port: 0,
      },
    },
    include: [
      'tests/browser/components/*/behavior.test.tsx',
      'tests/browser/components/*/a11y.test.tsx',
      'tests/browser/components/*/determinism.test.tsx',
    ],
  },
});
