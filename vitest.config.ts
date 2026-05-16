import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    projects: [
      './vitest.unit.config.ts',
      './vitest.jsdom.config.ts',
      './vitest.browser.config.ts',
    ],
  },
});
