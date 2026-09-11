import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    // Browser tests live in `playwright.config.ts` (`npm run test:browser`) and
    // are deliberately absent here: they no longer run under vitest.
    projects: ['./vitest.test.unit.config.ts', './vitest.test.jsdom.config.ts'],
  },
});
