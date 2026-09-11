import path from 'node:path';

import {
  type Locator,
  type Page,
  test as base,
  expect,
} from '@playwright/test';

export const HARNESS_URL = '/tests/browser/harness.html';

/**
 * Console output the suite tolerates: the one allowance the old vitest setup
 * carried, plus the dev client's own connection chatter. The latter is new only
 * because the harness page loads Vite's HMR client directly, where vitest
 * browser mode kept it outside the test iframe — it is infrastructure noise,
 * not component behavior. Vite's `[vite] error`/warning output is deliberately
 * not allowed.
 */
const ALLOWED_CONSOLE = [
  '[askr] Slow render detected',
  '[vite] connecting...',
  '[vite] connected.',
];

interface HarnessWindow {
  askrHarness: {
    mount(file: string, name: string, options: unknown): Promise<null>;
    run(name: string, args: unknown[]): Promise<unknown>;
    axeViolations(selector?: string): Promise<string[]>;
    teardown(): void;
  };
  /** Console output recorded by the guard installed in `consoleGuard`. */
  __askrConsole: string[];
  __askrConsoleAllowed: string[];
}

/**
 * Mounts a scenario exported by the scenario module mirroring this spec's path
 * under `tests/browser/` — `components/toggle/behavior.spec.ts` resolves
 * `tests/browser/scenarios/components/toggle/behavior.tsx`.
 *
 * `name` selects the export (default: `default`); `"<module>#<export>"` reaches
 * a shared scenario module instead of the one named after the spec.
 *
 * Named `render` rather than `mount` on purpose: Playwright reserves `mount`
 * for its own component-testing fixture, and reusing the name makes
 * `base.extend` reject this signature.
 */
export type Render = (name?: string, options?: unknown) => Promise<void>;

/** Invokes a control returned by the mounted scenario and yields its result. */
export type Run = <T = unknown>(
  control: string,
  ...args: unknown[]
) => Promise<T>;

interface Fixtures {
  /**
   * Loads the harness page (once per test) and mounts a scenario into a fresh
   * `#mount-root`. Defaults to the scenario module's `default` export.
   */
  render: Render;
  /** Renders raw markup into `#mount-root`, for slot/DOM-shape contracts. */
  markup: (html: string) => Promise<void>;
  /** Calls a control exposed by the scenario currently mounted. */
  run: Run;
  /** The `#mount-root` element the active scenario rendered into. */
  root: Locator;
  /**
   * Runs axe against the mounted tree (or `selector` within it) and returns the
   * violation summaries — the split form of the old `expectNoAxeViolations`.
   */
  axeViolations: (selector?: string) => Promise<string[]>;
  consoleGuard: void;
}

function scenarioModuleFor(file: string): string {
  const browserDir = path.join('tests', 'browser');
  const index = file.lastIndexOf(browserDir);
  const relative = index === -1 ? path.basename(file) : file.slice(index + browserDir.length + 1);
  return relative.replace(/\.spec\.ts$/u, '').split(path.sep).join('/');
}

async function openHarness(page: Page): Promise<void> {
  if (new URL(page.url(), 'http://127.0.0.1').pathname === HARNESS_URL) return;
  await page.goto(HARNESS_URL);
  await page.waitForFunction(() => 'askrHarness' in window);
}

export const test = base.extend<Fixtures>({
  /**
   * Replaces `tests/browser/browser-console.setup.ts`: patches the console in
   * the page and fails the test if anything unallowed was logged.
   *
   * Patching in-page rather than listening to Playwright's `console` event is
   * deliberate — that event also reports browser-internal advisories the vitest
   * trap never saw, which fails tests spuriously.
   */
  consoleGuard: [
    async ({ page }, use) => {
      await page.addInitScript((allowed: string[]) => {
        const harnessWindow = window as unknown as HarnessWindow;
        harnessWindow.__askrConsole = [];
        harnessWindow.__askrConsoleAllowed = allowed;

        const format = (values: unknown[]) =>
          values
            .map((value) => {
              if (typeof value === 'string') return value;
              try {
                return JSON.stringify(value);
              } catch {
                return String(value);
              }
            })
            .join(' ');

        for (const method of [
          'warn',
          'error',
          'log',
          'info',
          'debug',
        ] as const) {
          const original = console[method].bind(console);
          console[method] = ((...values: unknown[]) => {
            const message = format(values);
            if (
              !harnessWindow.__askrConsoleAllowed.some((pattern) =>
                message.includes(pattern)
              )
            ) {
              harnessWindow.__askrConsole.push(`${method}: ${message}`);
            }
            original(...values);
          }) as (typeof console)[typeof method];
        }
      }, ALLOWED_CONSOLE);

      await use();

      if (page.isClosed()) return;
      const unexpected = await page
        .evaluate(
          () => (window as unknown as HarnessWindow).__askrConsole ?? []
        )
        .catch(() => [] as string[]);
      if (unexpected.length > 0) {
        throw new Error(
          `Unexpected browser console output:\n${unexpected.join('\n')}`
        );
      }
    },
    { auto: true },
  ],

  render: async ({ page, consoleGuard }, use, testInfo) => {
    void consoleGuard;
    const specModule = scenarioModuleFor(testInfo.file);
    await use(async (name = 'default', options?: unknown) => {
      const [file, exportName = 'default'] = name.includes('#')
        ? name.split('#')
        : [specModule, name];
      await openHarness(page);
      await page.evaluate(
        ([scenarioFile, scenarioName, scenarioOptions]) =>
          (window as unknown as HarnessWindow).askrHarness.mount(
            scenarioFile as string,
            scenarioName as string,
            scenarioOptions
          ),
        [file, exportName, options ?? null] as const
      );
    });
  },

  markup: async ({ render }, use) => {
    await use(async (html: string) => {
      await render('_markup#default', { html });
    });
  },

  run: async ({ page }, use) => {
    await use((async (control: string, ...args: unknown[]) =>
      page.evaluate(
        ([name, callArgs]) =>
          (window as unknown as HarnessWindow).askrHarness.run(
            name as string,
            callArgs as unknown[]
          ),
        [control, args] as const
      )) as Run);
  },

  axeViolations: async ({ page }, use) => {
    await use(async (selector?: string) =>
      page.evaluate(
        (target) =>
          (window as unknown as HarnessWindow).askrHarness.axeViolations(
            target ?? undefined
          ),
        selector ?? null
      )
    );
  },

  root: async ({ page }, use) => {
    await use(page.locator('#mount-root'));
  },
});

export { expect };
export type { Locator, Page } from '@playwright/test';
