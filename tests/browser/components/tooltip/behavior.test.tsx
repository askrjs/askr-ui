import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { Button } from '../../../../src/components/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../../src/components/tooltip';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Tooltip - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    vi.restoreAllMocks();
    unmount(container);
  });

  it('should update trigger state around focus events', async () => {
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

  it('should open once from native focus without exhausting the scheduler', async () => {
    const onOpenChange = vi.fn();
    const onHoverCardOpenChange = vi.fn();
    container = mount(
      <>
        <button data-testid="before" tabIndex={0}>
          Before
        </button>
        <Button data-testid="button-control">Button control</Button>
        <HoverCard onOpenChange={onHoverCardOpenChange}>
          <HoverCardTrigger>HoverCard control</HoverCardTrigger>
          <HoverCardContent>HoverCard content</HoverCardContent>
        </HoverCard>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger tabIndex={0}>Hover me</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Helpful text</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </>
    );

    const buttonControl = container.querySelector(
      '[data-testid="button-control"]'
    ) as HTMLButtonElement;
    expect(() => buttonControl.focus()).not.toThrow();
    expect(document.activeElement).toBe(buttonControl);

    const hoverCardControl = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLButtonElement;
    expect(() => hoverCardControl.focus()).not.toThrow();
    await flushUpdates();
    expect(onHoverCardOpenChange).toHaveBeenCalledTimes(1);

    let trigger = container.querySelector(
      '[data-slot="tooltip-trigger"]'
    ) as HTMLButtonElement;
    expect(() => trigger.focus()).not.toThrow();
    await flushUpdates();

    trigger = container.querySelector(
      '[data-slot="tooltip-trigger"]'
    ) as HTMLButtonElement;
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('data-state')).toBe('open');
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('should open from a real keyboard Tab and preserve focus on the trigger', async () => {
    const onOpenChange = vi.fn();
    container = mount(
      <>
        <button data-testid="before" tabIndex={0}>
          Before
        </button>
        <Tooltip onOpenChange={onOpenChange}>
          <TooltipTrigger tabIndex={0}>Hover me</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Helpful text</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </>
    );

    const before = container.querySelector(
      '[data-testid="before"]'
    ) as HTMLButtonElement;
    before.focus();
    expect(document.activeElement).toBe(before);
    await userEvent.tab();
    await flushUpdates();

    const trigger = container.querySelector(
      '[data-slot="tooltip-trigger"]'
    ) as HTMLButtonElement;
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('data-state')).toBe('open');
  });

  it('should keep a controlled native-focus request bounded when the owner does not accept it', async () => {
    const onOpenChange = vi.fn();
    container = mount(
      <Tooltip open={false} onOpenChange={onOpenChange}>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Helpful text</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    );

    const trigger = container.querySelector(
      '[data-slot="tooltip-trigger"]'
    ) as HTMLButtonElement;
    expect(() => trigger.focus()).not.toThrow();
    await flushUpdates();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(trigger);
  });

  it('should cancel pending focus-adoption work during teardown', async () => {
    const cancelFrame = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {});
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 73);
    container = mount(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Helpful text</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    );

    const trigger = container.querySelector(
      '[data-slot="tooltip-trigger"]'
    ) as HTMLButtonElement;
    trigger.focus();
    await flushUpdates();
    unmount(container);
    container = undefined;

    expect(cancelFrame).toHaveBeenCalledWith(73);
  });

  it('should keep custom content positioning through the post-open portal sync', async () => {
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
    expect((content as HTMLElement | null)?.getAttribute('style')).toBeNull();
    expect(getComputedStyle(content as Element).left).toBe('148px');
    expect(getComputedStyle(content as Element).top).toBe('90px');
  });
});
