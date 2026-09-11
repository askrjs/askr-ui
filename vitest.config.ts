import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    // Browser tests live in `playwright.config.ts` (`npm run test:browser`) and
    // are deliberately absent here: they no longer run under vitest. Vitest
    // browser mode is still used, but only by `bench:tier4`.
    projects: ['./vitest.test.unit.config.ts', './vitest.test.jsdom.config.ts'],
  },
});
