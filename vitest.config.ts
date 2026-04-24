import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    projects: [
      './vitest.node.config.ts',
      './vitest.jsdom.config.ts',
      './vitest.browser.config.ts',
    ],
  },
});
