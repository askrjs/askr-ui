import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    projects: [
      './vitest.test.unit.config.ts',
      './vitest.test.jsdom.config.ts',
      './vitest.test.browser.config.ts',
    ],
  },
});
