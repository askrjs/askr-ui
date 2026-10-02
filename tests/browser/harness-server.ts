import { realpathSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite-plus';

/**
 * Port and identity plumbing for the Playwright browser harness, shared by
 * `playwright.config.ts`, `vite.harness.config.ts`, and the global setup.
 *
 * A fixed port with `reuseExistingServer` lets a run in one checkout silently
 * test another checkout's harness. So local runs take a free port each, reuse
 * is opt-in (`PW_REUSE_SERVER=1`), and the harness reports which checkout it
 * serves so a reused server from elsewhere is refused before any test runs.
 */

export const HARNESS_HOST = '127.0.0.1';
/** Port a manually started harness binds, and the port CI always uses. */
export const DEFAULT_HARNESS_PORT = 4318;
export const HARNESS_IDENTITY_PATH = '/__askr/harness-identity';
export const HARNESS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

const PORT_ENV = 'ASKR_TEST_PORT';
const REUSE_ENV = 'PW_REUSE_SERVER';

type Env = Record<string, string | undefined>;

export interface HarnessServer {
  port: number;
  baseURL: string;
  reuseExistingServer: boolean;
}

function isSet(value: string | undefined): boolean {
  return (
    value !== undefined &&
    value !== '' &&
    value !== '0' &&
    value.toLowerCase() !== 'false'
  );
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!/^\d+$/.test(value) || port < 1 || port > 65_535) {
    throw new Error(
      `${PORT_ENV} must be a port number between 1 and 65535, got "${value}".`
    );
  }
  return port;
}

function findFreePort(): Promise<number> {
  return new Promise((done, fail) => {
    const server = createServer();
    server.unref();
    server.once('error', fail);
    server.listen(0, HARNESS_HOST, () => {
      const address = server.address();
      server.close(() =>
        typeof address === 'object' && address
          ? done(address.port)
          : fail(new Error('Could not read the free port the OS assigned.'))
      );
    });
  });
}

/**
 * Decides which port the harness runs on and whether an existing server may be
 * reused.
 *
 * - CI: the fixed default port (or `ASKR_TEST_PORT`), never reused.
 * - `PW_REUSE_SERVER=1`: the default port (or `ASKR_TEST_PORT`), reused if a
 *   server is already there; the global setup still checks it is this checkout.
 * - Otherwise: `ASKR_TEST_PORT` if set, else a free port. The chosen port is
 *   written back to `ASKR_TEST_PORT` so Playwright workers, which re-evaluate
 *   the config with the runner's environment, agree on the same port.
 */
export async function resolveHarnessServer(
  env: Env = process.env
): Promise<HarnessServer> {
  const ci = isSet(env.CI);
  const reuse = !ci && isSet(env[REUSE_ENV]);
  const pinned = env[PORT_ENV];

  let port: number;
  if (pinned) port = parsePort(pinned);
  else if (ci || reuse) port = DEFAULT_HARNESS_PORT;
  else port = await findFreePort();
  env[PORT_ENV] = String(port);

  return {
    port,
    baseURL: `http://${HARNESS_HOST}:${port}`,
    reuseExistingServer: reuse,
  };
}

function normalizeRoot(path: string): string {
  let real = path;
  try {
    real = realpathSync.native(path);
  } catch {
    // A root that does not exist here cannot be this checkout; compare as is.
  }
  const resolved = resolve(real);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

/** Vite plugin that tells callers which checkout this harness serves. */
export function harnessIdentityPlugin(): Plugin {
  return {
    name: 'askr-harness-identity',
    configureServer(server) {
      server.middlewares.use(HARNESS_IDENTITY_PATH, (_req, res) => {
        res.setHeader('content-type', 'application/json');
        res.setHeader('cache-control', 'no-store');
        res.end(JSON.stringify({ root: HARNESS_ROOT }));
      });
    },
  };
}

/**
 * Fails unless the harness at `baseURL` reports this checkout's root. Runs as
 * Playwright's global setup, after the web server is up or has been reused.
 */
export async function verifyHarnessIdentity(baseURL: string): Promise<void> {
  const url = new URL(HARNESS_IDENTITY_PATH, baseURL).href;
  const restart =
    `Stop that server, or unset ${REUSE_ENV} to run on a free port, ` +
    `or set ${PORT_ENV} to a different port.`;

  let root: unknown;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    root = response.ok
      ? ((await response.json()) as { root?: unknown }).root
      : undefined;
  } catch {
    root = undefined;
  }

  if (typeof root !== 'string') {
    throw new Error(
      `The server at ${baseURL} is not an askr browser harness that identifies its checkout ` +
        `(no JSON at ${url}). It may belong to another checkout or predate this check. ${restart}`
    );
  }
  if (normalizeRoot(root) !== normalizeRoot(HARNESS_ROOT)) {
    throw new Error(
      `The harness at ${baseURL} serves another checkout (${root}), not ${HARNESS_ROOT}. ` +
        `Running against it would test that checkout's code. ${restart}`
    );
  }
}
