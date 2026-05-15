import { cleanupApp, createIsland } from '@askrjs/askr';
import { DefaultPortal } from '@askrjs/askr/foundations';
import type { Options as BenchOptions } from 'tinybench';

function resetBrowserBenchState() {
  DefaultPortal.render({ children: undefined });
  document
    .querySelectorAll('[data-key="__default_portal"]')
    .forEach((node) => node.parentNode?.removeChild(node));
  document
    .querySelectorAll('[data-askr-overlay-id]')
    .forEach((node) => node.parentNode?.removeChild(node));
}

async function nextAnimationFrame() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

export function mountBrowserBench(element: JSX.Element): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);

  createIsland({
    root: container,
    component: () => element,
  });

  return container;
}

export function unmountBrowserBench(container: HTMLElement | undefined) {
  if (container) {
    cleanupApp(container);
  }

  if (container?.parentNode) {
    container.parentNode.removeChild(container);
  }

  resetBrowserBenchState();
}

export async function flushBrowserBenchUpdates() {
  await Promise.resolve();
  await Promise.resolve();
}

export async function settleBrowserBenchEnvironment() {
  resetBrowserBenchState();
  await flushBrowserBenchUpdates();
  await nextAnimationFrame();
  await flushBrowserBenchUpdates();
}

export function createTier3BenchOptions(): BenchOptions {
  return {
    time: 750,
    warmupTime: 250,
    warmupIterations: 10,
    setup: async () => {
      await settleBrowserBenchEnvironment();
    },
    teardown: async () => {
      await settleBrowserBenchEnvironment();
    },
  };
}

export async function runBrowserBench(
  element: JSX.Element,
  callback: (container: HTMLElement) => void | Promise<void>
) {
  const container = mountBrowserBench(element);

  try {
    await callback(container);
  } finally {
    unmountBrowserBench(container);
  }
}
