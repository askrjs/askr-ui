import { playwright } from 'vite-plus/test/browser-playwright';
import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.test.shared';

/**
 * Tier 4 benchmarks are the only remaining vitest browser-mode workload: the
 * browser *test* suite now runs on native `@playwright/test`
 * (`playwright.config.ts`). This config used to extend
 * `vitest.test.browser.config.ts`; it carries that configuration inline instead
 * so the benches keep their browser runtime after that file's removal.
 */
export default defineConfig({
  ...sharedVitestConfig,
  optimizeDeps: {
    include: ['@askrjs/askr/testing'],
  },
  test: {
    ...sharedVitestConfig.test,
    setupFiles: [
      ...(sharedVitestConfig.test?.setupFiles ?? []),
      './benches/browser-console.setup.ts',
    ],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
      api: {
        host: '127.0.0.1',
        port: 0,
      },
    },
    benchmark: {
      include: ['benches/tier4/**/*.bench.ts', 'benches/tier4/**/*.bench.tsx'],
    },
  },
});
