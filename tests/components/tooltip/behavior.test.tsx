import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../src/components/composites/tooltip';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Tooltip - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    vi.restoreAllMocks();
    unmount(container);
  });

  it('updates trigger state around focus events', async () => {
    container = mount(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Helpful text</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    );

    let trigger = container.querySelector('button') as HTMLButtonElement;
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushUpdates();
    trigger = container.querySelector('button') as HTMLButtonElement;

    expect(trigger.getAttribute('data-state')).toBe('open');

    trigger.dispatchEvent(new PointerEvent('pointerleave'));
    await flushUpdates();
    trigger = container.querySelector('button') as HTMLButtonElement;

    expect(trigger.getAttribute('data-state')).toBe('closed');
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

        if (slot === 'tooltip-trigger') {
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

        if (slot === 'tooltip-content') {
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
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="right" align="end" sideOffset={8}>
            Helpful text
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    );

    const trigger = container.querySelector('button') as HTMLButtonElement;
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushUpdates();

    const content = container.querySelector('[data-slot="tooltip-content"]');

    expect(content?.getAttribute('data-side')).toBe('right');
    expect(content?.dataset.side).toBe('right');
    expect((content as HTMLElement | null)?.style.left).toBe('148px');
    expect((content as HTMLElement | null)?.style.top).toBe('90px');
  });
});
