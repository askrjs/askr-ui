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
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../src/components';
import {
  createTier3BenchOptions,
  flushBrowserBenchUpdates,
  runBrowserBench,
} from './browser-bench';

async function openAndCloseWithEscape(
  container: HTMLElement,
  triggerSelector: string,
  contentSelector: string
) {
  const trigger = container.querySelector(triggerSelector) as HTMLElement;

  trigger.click();
  await flushBrowserBenchUpdates();

  const content = document.body.querySelector(
    contentSelector
  ) as HTMLElement | null;

  if (!content) {
    throw new Error(`Missing overlay content for ${contentSelector}`);
  }

  content.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  );
  await flushBrowserBenchUpdates();
}

const tier3BenchOptions = createTier3BenchOptions();

describe('Dialog benches', () => {
  bench(
    'open and close dialog',
    async () => {
      await runBrowserBench(
        <Dialog>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogPortal>
            <DialogContent>Dialog body</DialogContent>
          </DialogPortal>
        </Dialog>,
        async (container) => {
          await openAndCloseWithEscape(
            container,
            '[data-slot="dialog-trigger"]',
            '[data-slot="dialog-content"]'
          );
        }
      );
    },
    tier3BenchOptions
  );
});

describe('Popover benches', () => {
  bench(
    'open and close popover',
    async () => {
      await runBrowserBench(
        <Popover>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent>Popover body</PopoverContent>
          </PopoverPortal>
        </Popover>,
        async (container) => {
          await openAndCloseWithEscape(
            container,
            '[data-slot="popover-trigger"]',
            '[data-slot="popover-content"]'
          );
        }
      );
    },
    tier3BenchOptions
  );
});

describe('Dropdown benches', () => {
  bench(
    'open and close dropdown',
    async () => {
      await runBrowserBench(
        <Dropdown>
          <DropdownTrigger>Open dropdown</DropdownTrigger>
          <DropdownPortal>
            <DropdownContent>
              <DropdownItem>Archive</DropdownItem>
            </DropdownContent>
          </DropdownPortal>
        </Dropdown>,
        async (container) => {
          await openAndCloseWithEscape(
            container,
            '[data-slot="dropdown-trigger"]',
            '[data-slot="dropdown-content"]'
          );
        }
      );
    },
    tier3BenchOptions
  );
});
