import { defineConfig } from 'vite-plus';
import browserConfig from './vitest.browser.config';

export default defineConfig({
  ...browserConfig,
  test: {
    ...browserConfig.test,
    benchmark: {
      include: ['benches/tier3/**/*.bench.ts', 'benches/tier3/**/*.bench.tsx'],
    },
  },
});
