import { cleanupApp, createIsland } from '@askrjs/askr/boot';
import { DefaultPortal } from '@askrjs/askr/foundations/structures';

/**
 * Browser-side mounting helpers shared by every scenario module — the native
 * Playwright port of the old `tests/test-utils.tsx`.
 *
 * Scenarios run inside the harness page, so they, not the spec, own JSX and
 * component state. Everything here exists to keep a scenario module down to a
 * component tree plus the controls the spec needs to read back.
 */

const activeContainers = new Set<HTMLElement>();

/** Clears the default portal, matching the old `resetTestState`. */
export function resetTestState(): void {
  DefaultPortal.render({ children: undefined });
  document
    .querySelectorAll('[data-key="__default_portal"]')
    .forEach((node) => node.parentNode?.removeChild(node));
}

/**
 * Mounts `element` into a fresh container. When `parent` is given the container
 * is appended there (normally the harness `#mount-root`, so Playwright locators
 * scoped to `root` can see it); otherwise it is appended to `document.body`,
 * which is what the markup-only and determinism helpers want.
 */
export function mount(
  element: JSX.Element,
  parent: HTMLElement = document.body
): HTMLElement {
  const container = document.createElement('div');
  parent.appendChild(container);
  activeContainers.add(container);
  createIsland({
    root: container,
    component: () => element,
  });
  return container;
}

/** Awaits the two microtask ticks an askr render settles in. */
export async function flushUpdates(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

/** Lets pending microtasks, timers, and one animation frame flush. */
export async function settle(): Promise<void> {
  await flushUpdates();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

export function unmount(container: HTMLElement | undefined): void {
  if (container) {
    cleanupApp(container);
    activeContainers.delete(container);
  }

  if (container?.parentNode) {
    container.parentNode.removeChild(container);
  }

  resetTestState();
}

/**
 * Tears down every container the current scenario mounted. The harness calls
 * this before mounting the next scenario, so a spec never has to unwind state
 * a previous test left behind.
 */
export function disposeMounts(): void {
  for (const container of [...activeContainers]) unmount(container);
  activeContainers.clear();
  resetTestState();
}

/* -------------------------------------------------------------------------- */
/* Spies                                                                      */
/* -------------------------------------------------------------------------- */

export interface Spy<Args extends unknown[] = unknown[], Result = void> {
  (...args: Args): Result;
  /** Every argument list the spy was called with, in order. */
  readonly calls: Args[];
  /** Number of calls — the `toHaveBeenCalledTimes` equivalent. */
  count(): number;
}

/** Browser-side stand-in for `vi.fn()`; a scenario hands its counts to a spec. */
export function spy<Args extends unknown[] = unknown[], Result = void>(
  implementation?: (...args: Args) => Result
): Spy<Args, Result> {
  const calls: Args[] = [];
  const fn = ((...args: Args): Result => {
    calls.push(args);
    return implementation?.(...args) as Result;
  }) as Spy<Args, Result>;

  Object.defineProperty(fn, 'calls', { get: () => calls });
  fn.count = () => calls.length;
  return fn;
}

/* -------------------------------------------------------------------------- */
/* Timer capture                                                              */
/* -------------------------------------------------------------------------- */

export interface TimerCapture {
  timeouts(): number;
  intervals(): number;
  restore(): void;
}

/**
 * Counts `setTimeout`/`setInterval` calls, replacing
 * `vi.spyOn(globalThis, 'setTimeout')` in determinism specs.
 */
export function captureTimers(): TimerCapture {
  const originalTimeout = globalThis.setTimeout;
  const originalInterval = globalThis.setInterval;
  let timeouts = 0;
  let intervals = 0;

  globalThis.setTimeout = ((...args: Parameters<typeof setTimeout>) => {
    timeouts += 1;
    return originalTimeout(...args);
  }) as typeof setTimeout;
  globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
    intervals += 1;
    return originalInterval(...args);
  }) as typeof setInterval;

  return {
    timeouts: () => timeouts,
    intervals: () => intervals,
    restore: () => {
      globalThis.setTimeout = originalTimeout;
      globalThis.setInterval = originalInterval;
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Determinism                                                                */
/* -------------------------------------------------------------------------- */

export interface DeterministicRender {
  /** Identifies the tree in the spec's `test.step` label on failure. */
  label: string;
  first: string;
  second: string;
}

function normalizeDeterministicMarkup(html: string): string {
  return html.replace(/ data-key="Symbol\(AskrContext[^"]*\)"/g, '');
}

function renderHtml(element: JSX.Element): string {
  resetTestState();
  const container = mount(element);

  try {
    return container.innerHTML;
  } finally {
    unmount(container);
  }
}

/**
 * Renders `factory` twice and returns both markup strings for the spec to
 * compare — the split form of the old `expectDeterministicRender`, which could
 * not survive the Node/browser boundary as an assertion.
 */
export function deterministicRender(
  label: string,
  factory: () => JSX.Element
): DeterministicRender {
  return {
    label,
    first: normalizeDeterministicMarkup(renderHtml(factory())),
    second: normalizeDeterministicMarkup(renderHtml(factory())),
  };
}
