import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../src/components/composites/popover';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Popover - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.restoreAllMocks();
    unmount(container);
  });

  it('toggles trigger expansion state through the trigger', async () => {
    container = mount(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Details</PopoverContent>
      </Popover>
    );

    let trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await flushUpdates();
    trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('applies trigger-based dialog labeling by default', async () => {
    container = mount(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Details</PopoverContent>
      </Popover>
    );

    await flushUpdates();

    const trigger = container.querySelector('[aria-haspopup="dialog"]');
    const content = document.body.querySelector(
      '[role="dialog"]'
    ) as HTMLElement | null;

    expect(trigger).toBeTruthy();
    expect(content).toBeTruthy();
    expect(trigger?.id).toBeTruthy();
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger?.id);
  });

  it('preserves explicit aria-label over automatic trigger labeling', async () => {
    container = mount(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent aria-label="Popover details">Details</PopoverContent>
      </Popover>
    );

    await flushUpdates();

    const content = document.body.querySelector(
      '[role="dialog"]'
    ) as HTMLElement | null;

    expect(content).toBeTruthy();
    expect(content?.getAttribute('aria-label')).toBe('Popover details');
    expect(content?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('keeps custom content positioning through the post-open portal sync', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      }
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function getBoundingClientRect(this: HTMLElement): DOMRect {
        const slot = this.getAttribute('data-slot');

        if (slot === 'popover-trigger') {
          return {
            x: 100,
            y: 100,
            width: 40,
            height: 20,
            top: 100,
            right: 140,
            bottom: 120,
            left: 100,
            toJSON: () => ({}),
          } as DOMRect;
        }

        if (slot === 'popover-content') {
          return {
            x: 0,
            y: 0,
            width: 60,
            height: 30,
            top: 0,
            right: 60,
            bottom: 30,
            left: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }

        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }
    );

    container = mount(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent side="right" align="end" sideOffset={8}>
            Details
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    );

    const trigger = container.querySelector(
      '[aria-haspopup="dialog"]'
    ) as HTMLElement;
    trigger.click();
    await flushUpdates();

    const content = container.querySelector('[data-slot="popover-content"]');

    expect(content?.getAttribute('data-side')).toBe('right');
    expect(content?.dataset.side).toBe('right');
    expect((content as HTMLElement | null)?.style.left).toBe('148px');
    expect((content as HTMLElement | null)?.style.top).toBe('90px');
  });
});
