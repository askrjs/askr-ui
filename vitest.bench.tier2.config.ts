import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.test.shared';

export default defineConfig({
  test: {
    ...sharedVitestConfig.test,
    environment: 'jsdom',
    include: ['benches/tier2/**/*.bench.ts', 'benches/tier2/**/*.bench.tsx'],
    benchmark: {
      include: ['benches/tier2/**/*.bench.ts', 'benches/tier2/**/*.bench.tsx'],
    },
  },
  plugins: sharedVitestConfig.plugins,
  oxc: sharedVitestConfig.oxc,
  resolve: sharedVitestConfig.resolve,
});
