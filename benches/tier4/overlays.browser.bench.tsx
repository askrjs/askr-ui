import { state } from '@askrjs/askr';
import { bench, describe } from 'vite-plus/test';
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../src/components';
import {
  createBrowserListenerTracker,
  createTier4BenchOptions,
  mountBrowserBench,
  settleBrowserBenchCycle,
  unmountBrowserBench,
} from './browser-bench';

const lifecycleCycles = 100;
const tier4BenchOptions = createTier4BenchOptions();

type ListenerTracker = ReturnType<typeof createBrowserListenerTracker>;

function assertOverlayLifecycleCleanup(
  tracker: ListenerTracker,
  expectedListeners: number,
  contentSelector: string,
  label: string
) {
  const activeListeners = tracker.countActiveListeners();

  if (activeListeners !== expectedListeners) {
    throw new Error(
      `Expected ${expectedListeners} active listeners ${label}, found ${activeListeners} for ${contentSelector}`
    );
  }

  if (document.body.querySelector(contentSelector)) {
    throw new Error(
      `Expected ${contentSelector} to be removed ${label}, but it was still present`
    );
  }

  const retainedOverlayNodes = document.body.querySelectorAll(
    '[data-askr-overlay-id]'
  ).length;

  if (retainedOverlayNodes !== 0) {
    throw new Error(
      `Expected no retained overlay DOM ${label}, found ${retainedOverlayNodes} nodes`
    );
  }
}

async function runOverlayLifecycleBench(options: {
  element: JSX.Element;
  triggerSelector: string;
  contentSelector: string;
  open: (trigger: HTMLElement) => void | Promise<void>;
  close: (trigger: HTMLElement, content: HTMLElement) => void | Promise<void>;
}) {
  const tracker = createBrowserListenerTracker();
  const container = mountBrowserBench(options.element);
  let failed = false;

  try {
    const mountedListenerCount = tracker.countActiveListeners();

    for (let cycle = 0; cycle < lifecycleCycles; cycle += 1) {
      const trigger = container.querySelector(
        options.triggerSelector
      ) as HTMLElement | null;

      if (!trigger) {
        throw new Error(
          `Missing overlay trigger for ${options.triggerSelector}`
        );
      }

      await options.open(trigger);
      await settleBrowserBenchCycle();

      const content = document.body.querySelector(
        options.contentSelector
      ) as HTMLElement | null;

      if (!content) {
        throw new Error(
          `Missing overlay content for ${options.contentSelector}`
        );
      }

      await options.close(trigger, content);
      await settleBrowserBenchCycle();

      assertOverlayLifecycleCleanup(
        tracker,
        mountedListenerCount,
        options.contentSelector,
        `after cycle ${cycle + 1}`
      );
    }
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    unmountBrowserBench(container);

    if (!failed) {
      assertOverlayLifecycleCleanup(
        tracker,
        0,
        options.contentSelector,
        'after unmount'
      );
    }

    tracker.dispose();
  }
}

function ToastLifecycleFixture() {
  const openState = state(false);

  return (
    <ToastProvider duration={1000}>
      <button
        id="toast-launcher"
        onClick={() => {
          openState.set(true);
        }}
      >
        Show toast
      </button>
      <ToastViewport />
      <Toast open={openState()} onOpenChange={(open) => openState.set(open)}>
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>Changes stored</ToastDescription>
        <ToastClose>Dismiss</ToastClose>
      </Toast>
    </ToastProvider>
  );
}

describe('Dialog lifecycle benches', () => {
  bench(
    'cycle 100 dialog open/close with listener cleanup',
    async () => {
      await runOverlayLifecycleBench({
        element: (
          <Dialog>
            <DialogTrigger>Open dialog</DialogTrigger>
            <DialogPortal>
              <DialogContent>Dialog body</DialogContent>
            </DialogPortal>
          </Dialog>
        ),
        triggerSelector: '[data-slot="dialog-trigger"]',
        contentSelector: '[data-slot="dialog-content"]',
        open: (trigger) => {
          trigger.click();
        },
        close: (_trigger, content) => {
          content.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          );
        },
      });
    },
    tier4BenchOptions
  );
});

describe('Popover lifecycle benches', () => {
  bench(
    'cycle 100 popover open/close with listener cleanup',
    async () => {
      await runOverlayLifecycleBench({
        element: (
          <Popover>
            <PopoverTrigger>Open popover</PopoverTrigger>
            <PopoverPortal>
              <PopoverContent>Popover body</PopoverContent>
            </PopoverPortal>
          </Popover>
        ),
        triggerSelector: '[data-slot="popover-trigger"]',
        contentSelector: '[data-slot="popover-content"]',
        open: (trigger) => {
          trigger.click();
        },
        close: (_trigger, content) => {
          content.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          );
        },
      });
    },
    tier4BenchOptions
  );
});

describe('Dropdown lifecycle benches', () => {
  bench(
    'cycle 100 dropdown open/close with listener cleanup',
    async () => {
      await runOverlayLifecycleBench({
        element: (
          <Dropdown>
            <DropdownTrigger>Open dropdown</DropdownTrigger>
            <DropdownPortal>
              <DropdownContent>
                <DropdownItem>Archive</DropdownItem>
              </DropdownContent>
            </DropdownPortal>
          </Dropdown>
        ),
        triggerSelector: '[data-slot="dropdown-trigger"]',
        contentSelector: '[data-slot="dropdown-content"]',
        open: (trigger) => {
          trigger.click();
        },
        close: (_trigger, content) => {
          content.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          );
        },
      });
    },
    tier4BenchOptions
  );
});

describe('Select lifecycle benches', () => {
  bench(
    'cycle 100 select open/close with listener cleanup',
    async () => {
      await runOverlayLifecycleBench({
        element: (
          <Select defaultValue="askr">
            <SelectTrigger>
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem value="askr">Askr</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
              </SelectContent>
            </SelectPortal>
          </Select>
        ),
        triggerSelector: '[data-slot="select-trigger"]',
        contentSelector: '[data-slot="select-content"]',
        open: (trigger) => {
          trigger.click();
        },
        close: (_trigger, content) => {
          content.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          );
        },
      });
    },
    tier4BenchOptions
  );
});

describe('Tooltip lifecycle benches', () => {
  bench(
    'cycle 100 tooltip open/close with listener cleanup',
    async () => {
      await runOverlayLifecycleBench({
        element: (
          <Tooltip>
            <TooltipTrigger>Help</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Body</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        ),
        triggerSelector: '[data-slot="tooltip-trigger"]',
        contentSelector: '[data-slot="tooltip-content"]',
        open: (trigger) => {
          trigger.focus();
        },
        close: (trigger) => {
          trigger.blur();
        },
      });
    },
    tier4BenchOptions
  );
});

describe('Toast lifecycle benches', () => {
  bench(
    'cycle 100 toast open/close with listener cleanup',
    async () => {
      await runOverlayLifecycleBench({
        element: <ToastLifecycleFixture />,
        triggerSelector: '#toast-launcher',
        contentSelector: '[data-toast="true"]',
        open: (trigger) => {
          trigger.click();
        },
        close: (_trigger, content) => {
          const close = content.querySelector(
            '[data-toast-close="true"]'
          ) as HTMLButtonElement | null;

          if (!close) {
            throw new Error('Missing toast close control');
          }

          close.click();
        },
      });
    },
    tier4BenchOptions
  );
});