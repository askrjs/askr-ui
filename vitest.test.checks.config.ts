import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integrity/dev_checks/**/*.test.{ts,tsx}'],
  },
});
