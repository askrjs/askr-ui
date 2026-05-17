import { cleanupApp, createIsland } from '@askrjs/askr/boot';
import { DefaultPortal } from '@askrjs/askr/foundations/structures';
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

export async function settleBrowserBenchCycle() {
  await flushBrowserBenchUpdates();
  await nextAnimationFrame();
  await flushBrowserBenchUpdates();
}

type ListenerTargetRegistry = Map<
  string,
  Set<EventListenerOrEventListenerObject>
>;

export function createBrowserListenerTracker() {
  const registrations = new Map<EventTarget, ListenerTargetRegistry>();
  const prototype = EventTarget.prototype as EventTarget & {
    addEventListener: typeof EventTarget.prototype.addEventListener;
    removeEventListener: typeof EventTarget.prototype.removeEventListener;
  };
  const originalAddEventListener = prototype.addEventListener;
  const originalRemoveEventListener = prototype.removeEventListener;

  const getCaptureKey = (options?: boolean | AddEventListenerOptions) =>
    typeof options === 'boolean' ? options : Boolean(options?.capture);

  const getListenerRegistry = (target: EventTarget) => {
    const existing = registrations.get(target);

    if (existing) {
      return existing;
    }

    const created: ListenerTargetRegistry = new Map();
    registrations.set(target, created);
    return created;
  };

  const recordListener = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options: boolean | AddEventListenerOptions | undefined,
    operation: 'add' | 'remove'
  ) => {
    if (!listener) {
      return;
    }

    const registry = getListenerRegistry(target);
    const key = `${type}:${getCaptureKey(options) ? '1' : '0'}`;
    const listeners = registry.get(key) ?? new Set();

    if (operation === 'add') {
      listeners.add(listener);
    } else {
      listeners.delete(listener);
    }

    if (listeners.size === 0) {
      registry.delete(key);
    } else {
      registry.set(key, listeners);
    }

    if (registry.size === 0) {
      registrations.delete(target);
    }
  };

  prototype.addEventListener = function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    recordListener(this, type, listener, options, 'add');
    return originalAddEventListener.call(this, type, listener, options);
  };

  prototype.removeEventListener = function (
    this: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ) {
    recordListener(this, type, listener, options, 'remove');
    return originalRemoveEventListener.call(this, type, listener, options);
  };

  return {
    countActiveListeners() {
      let count = 0;

      for (const registry of registrations.values()) {
        for (const listeners of registry.values()) {
          count += listeners.size;
        }
      }

      return count;
    },
    dispose() {
      prototype.addEventListener = originalAddEventListener;
      prototype.removeEventListener = originalRemoveEventListener;
      registrations.clear();
    },
  };
}

export async function settleBrowserBenchEnvironment() {
  resetBrowserBenchState();
  await settleBrowserBenchCycle();
}

export function createTier4BenchOptions(): BenchOptions {
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
