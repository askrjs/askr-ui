// @vitest-environment node

import { createServer, type Server } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

const ROOT_DIR = resolve(__dirname, '..', '..', '..');

const HOST = '127.0.0.1';
const DEFAULT_PORT = 4318;
const ENV_KEYS = ['CI', 'ASKR_TEST_PORT', 'PW_REUSE_SERVER'] as const;

type WebServer = {
  url?: string;
  command: string;
  reuseExistingServer?: boolean;
};
type LoadedConfig = {
  webServer?: WebServer | WebServer[];
  globalSetup?: string | string[];
};

const servers: Server[] = [];
const dirs: string[] = [];

afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(
    servers.splice(0).map((s) => new Promise((done) => s.close(done)))
  );
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

/**
 * Stands in for a harness started from another checkout: it answers the
 * readiness URL Playwright polls and reports a different repository root.
 * Resolves `null` when the port is already taken, which is the same situation
 * from the config's point of view (someone else's server is on it).
 */
function startForeignHarness(
  port: number,
  root: string
): Promise<Server | null> {
  const server = createServer((req, res) => {
    if (req.url?.startsWith('/__askr/harness')) {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ root }));
      return;
    }
    res.setHeader('content-type', 'text/html');
    res.end('<!doctype html><title>foreign harness</title>');
  });
  return new Promise((done, fail) => {
    server.once('error', (error: NodeJS.ErrnoException) =>
      error.code === 'EADDRINUSE' ? done(null) : fail(error)
    );
    server.listen(port, HOST, () => {
      servers.push(server);
      done(server);
    });
  });
}

function freePort(): Promise<number> {
  const server = createServer();
  return new Promise((done) =>
    server.listen(0, HOST, () => {
      const address = server.address();
      server.close(() =>
        done(typeof address === 'object' && address ? address.port : 0)
      );
    })
  );
}

async function loadConfig(
  env: Partial<Record<(typeof ENV_KEYS)[number], string>>
) {
  for (const key of ENV_KEYS) vi.stubEnv(key, env[key]);
  vi.resetModules();
  const config = (await import('../../../playwright.config.ts'))
    .default as LoadedConfig;
  const webServer = Array.isArray(config.webServer)
    ? config.webServer[0]
    : config.webServer;
  if (!webServer?.url)
    throw new Error('playwright.config.ts has no webServer url');
  return { config, webServer, port: Number(new URL(webServer.url).port) };
}

async function runGlobalSetup(config: LoadedConfig, webServer: WebServer) {
  const setups = [config.globalSetup ?? []].flat();
  expect(
    setups.length,
    'playwright.config.ts should verify the harness in globalSetup'
  ).toBe(1);
  const mod = await import(pathToFileURL(resolve(ROOT_DIR, setups[0])).href);
  return mod.default({ webServer });
}

function otherCheckout() {
  const dir = mkdtempSync(join(tmpdir(), 'askr-other-checkout-'));
  dirs.push(dir);
  return dir;
}

describe('playwright harness server', () => {
  it("should not attach to another checkout's harness on the default port", async () => {
    await startForeignHarness(DEFAULT_PORT, otherCheckout());
    const { webServer, port } = await loadConfig({});

    expect(webServer.reuseExistingServer).toBe(false);
    expect(port).not.toBe(DEFAULT_PORT);
    expect(webServer.command).toContain(`--port ${port}`);
  });

  it('should share one port between the web server and baseURL across config loads', async () => {
    const first = await loadConfig({});
    const again = await import('../../../playwright.config.ts?reload');
    const reloaded = (again.default as LoadedConfig).webServer as WebServer;

    expect(new URL(reloaded.url ?? '').port).toBe(String(first.port));
  });

  it('should keep the fixed port and never reuse on CI', async () => {
    const { webServer, port } = await loadConfig({
      CI: 'true',
      PW_REUSE_SERVER: '1',
    });

    expect(port).toBe(DEFAULT_PORT);
    expect(webServer.reuseExistingServer).toBe(false);
  });

  it('should honour an explicit ASKR_TEST_PORT', async () => {
    const pinned = await freePort();
    const { webServer, port } = await loadConfig({
      ASKR_TEST_PORT: String(pinned),
    });

    expect(port).toBe(pinned);
    expect(webServer.command).toContain(`--port ${pinned}`);
  });

  it('should reject an invalid ASKR_TEST_PORT', async () => {
    await expect(loadConfig({ ASKR_TEST_PORT: 'not-a-port' })).rejects.toThrow(
      /ASKR_TEST_PORT/
    );
  });

  it('should reuse only when asked and refuse a harness from another checkout', async () => {
    const port = await freePort();
    await startForeignHarness(port, otherCheckout());
    const { config, webServer } = await loadConfig({
      ASKR_TEST_PORT: String(port),
      PW_REUSE_SERVER: '1',
    });

    expect(webServer.reuseExistingServer).toBe(true);
    await expect(runGlobalSetup(config, webServer)).rejects.toThrow(
      /another checkout/
    );
  });

  it('should accept a reused harness that serves this checkout', async () => {
    const port = await freePort();
    await startForeignHarness(port, ROOT_DIR);
    const { config, webServer } = await loadConfig({
      ASKR_TEST_PORT: String(port),
      PW_REUSE_SERVER: '1',
    });

    await expect(runGlobalSetup(config, webServer)).resolves.toBeUndefined();
  });
});
