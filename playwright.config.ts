import { defineConfig, devices } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = 4318;
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    // `vp dev` rather than `vite`: vite-plus aliases the `vite` package to a
    // core package that ships no CLI binary, and installing a real `vite`
    // alongside it makes `vp pack` refuse to run at all.
    //
    // `--strictPort` turns a port collision into an immediate failure instead
    // of a server listening on a port nobody is polling.
    //
    // `--host 127.0.0.1` must match `webServer.url`: Vite otherwise binds
    // `localhost`, which CI runners can resolve to `::1` while Playwright's
    // readiness probe polls the literal IPv4 address — a silent startup
    // timeout that passes locally.
    command: `npx vp dev --config vite.harness.config.ts --host ${HOST} --port ${PORT} --strictPort`,
    url: `${BASE_URL}/tests/browser/harness.html`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000,
  },
});
