import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.base.config';

export default defineConfig({
  test: {
    ...sharedVitestConfig.test,
    environment: 'jsdom',
    include: ['benches/**/*.bench.ts', 'benches/**/*.bench.tsx'],
    benchmark: {
      include: ['benches/**/*.bench.ts', 'benches/**/*.bench.tsx'],
    },
  },
  plugins: sharedVitestConfig.plugins,
  oxc: sharedVitestConfig.oxc,
  resolve: sharedVitestConfig.resolve,
});
