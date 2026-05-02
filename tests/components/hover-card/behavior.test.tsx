import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../src/components/composites/hover-card';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('HoverCard - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    vi.useRealTimers();
    unmount(container);
    container = undefined;
  });

  it('opens and closes from hover and focus state changes', async () => {
    vi.useFakeTimers();

    container = mount(
      <HoverCard>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;

    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(1);
    await flushUpdates();

    const openTrigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;

    expect(openTrigger.getAttribute('data-state')).toBe('open');
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();

    openTrigger.dispatchEvent(
      new PointerEvent('pointerleave', { bubbles: true })
    );
    await vi.runAllTimersAsync();
    await flushUpdates();

    const closedTrigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;

    expect(closedTrigger.getAttribute('data-state')).toBe('closed');
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).toBeNull();

  });

  it('supports asChild composition and ref forwarding', async () => {
    const triggerRef = { current: null as HTMLAnchorElement | null };
    const contentRef = { current: null as HTMLElement | null };

    container = mount(
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild ref={triggerRef}>
          <a href="/preview">Preview</a>
        </HoverCardTrigger>
        <HoverCardContent asChild ref={contentRef}>
          <section>Details</section>
        </HoverCardContent>
      </HoverCard>
    );

    await flushUpdates();

    const trigger = container.querySelector('a') as HTMLAnchorElement | null;
    const content = document.body.querySelector(
      'section[data-slot="hover-card-content"]'
    ) as HTMLElement | null;

    expect(trigger?.getAttribute('data-slot')).toBe('hover-card-trigger');
    expect(content?.getAttribute('data-slot')).toBe('hover-card-content');
    expect(triggerRef.current).toBe(trigger);
    expect(contentRef.current).toBe(content);
  });
});
