import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'jsdom',
    include: ['benches/tier3/**/*.bench.ts', 'benches/tier3/**/*.bench.tsx'],
    benchmark: {
      include: ['benches/tier3/**/*.bench.ts', 'benches/tier3/**/*.bench.tsx'],
    },
  },
  plugins: sharedVitestConfig.plugins,
  oxc: sharedVitestConfig.oxc,
  resolve: sharedVitestConfig.resolve,
});
