import { defineConfig } from 'vite-plus';
import { sharedVitestConfig } from './vitest.test.shared';

export default defineConfig({
  ...sharedVitestConfig,
  test: {
    ...sharedVitestConfig.test,
    environment: 'node',
    include: [
      'tests/unit/composite-id.test.tsx',
      'tests/unit/overlay/z-index.test.ts',
      'tests/unit/overlay/nonce.test.ts',
      'tests/unit/overlay/portal.test.ts',
      'tests/unit/focus/modality.test.ts',
      'tests/unit/virtualization-ssr.test.tsx',
    ],
  },
});
