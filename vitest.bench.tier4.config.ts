import { defineConfig } from 'vite-plus';
import browserConfig from './vitest.test.browser.config';

export default defineConfig({
  ...browserConfig,
  test: {
    ...browserConfig.test,
    benchmark: {
      include: ['benches/tier4/**/*.bench.ts', 'benches/tier4/**/*.bench.tsx'],
    },
  },
});
