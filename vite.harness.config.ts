import { askr } from '@askrjs/vite';
import { defineConfig } from 'vite-plus';

/**
 * Dev server used only by the native Playwright browser suite: it serves the
 * repository root so specs can reach `tests/browser/harness.html`. The library
 * build lives in `vite.config.ts` (`vp pack`); nothing here ships.
 *
 * `server.host` is pinned to `127.0.0.1` rather than left at Vite's `localhost`
 * default because Playwright's `webServer` readiness probe polls the literal
 * address in `webServer.url`; a `localhost`-bound server silently fails that
 * probe on runners that resolve `localhost` to `::1`.
 */
export default defineConfig({
  // `askr()` installs the JSX transform (automatic runtime, `@askrjs/askr`
  // import source) that the scenario modules compile against.
  plugins: [askr()],
  resolve: {
    dedupe: ['@askrjs/askr'],
  },
  // Scenario modules are imported lazily, so without an explicit scan list Vite
  // discovers their dependencies mid-test and forces a full page reload — which
  // destroys the execution context an in-flight `page.evaluate` is using.
  optimizeDeps: {
    entries: [
      'tests/browser/harness.ts',
      'tests/browser/scenarios/**/*.ts',
      'tests/browser/scenarios/**/*.tsx',
    ],
    include: ['axe-core'],
  },
  server: {
    host: '127.0.0.1',
    port: 4318,
    strictPort: true,
    // Transform the harness and every scenario up front. Without this the first
    // worker to reach a given scenario pays the transform cost inline, which
    // under full parallelism on a cold runner shows up as timeouts.
    warmup: {
      clientFiles: [
        './tests/browser/harness.ts',
        './tests/browser/scenarios/**/*.ts',
        './tests/browser/scenarios/**/*.tsx',
      ],
    },
  },
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: '@askrjs/askr',
    },
    jsxInject:
      "import { jsx, jsxs, Fragment } from '@askrjs/askr/jsx-runtime';",
  },
});
