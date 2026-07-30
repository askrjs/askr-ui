import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('HoverCard - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    vi.useRealTimers();
    unmount(container);
    container = undefined;
  });

  it('should opens and closes from hover and focus state changes', async () => {
    vi.useFakeTimers();

    container = mount(
      <HoverCard>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    let trigger = container.querySelector(
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

  it('should supports asChild composition and ref forwarding', async () => {
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

  it('should preserve controlled open state given open and onOpenChange when hover and focus events interleave', async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    container = mount(
      <HoverCard open={false} onOpenChange={onOpenChange}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );
    let trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    trigger.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await flushUpdates();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute('data-state')).toBe('closed');
  });

  it('should cancel delayed close given pointer movement from trigger to content when the close timer is pending', async () => {
    vi.useFakeTimers();
    container = mount(
      <HoverCard defaultOpen closeDelay={50}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );
    await flushUpdates();
    let trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    const content = document.body.querySelector(
      '[data-slot="hover-card-content"]'
    ) as HTMLElement;
    trigger.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    content.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(60);
    await flushUpdates();
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();
  });

  it('should expose complete dialog labeling given a trigger and content when the card is open', async () => {
    container = mount(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );
    await flushUpdates();
    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    const content = document.body.querySelector(
      '[data-slot="hover-card-content"]'
    ) as HTMLElement;
    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('should preserve pointer focus and support Tab, Shift+Tab, and Escape across interactive content', async () => {
    container = mount(
      <>
        <button data-testid="before">Before</button>
        <HoverCard>
          <HoverCardTrigger>Preview</HoverCardTrigger>
          <HoverCardContent>
            <a href="/first">First</a>
            <button>Last</button>
          </HoverCardContent>
        </HoverCard>
        <button data-testid="after">After</button>
      </>
    );
    const before = container.querySelector(
      '[data-testid="before"]'
    ) as HTMLElement;
    let trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    before.focus();
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await flushUpdates();
    expect(document.activeElement).toBe(before);

    trigger.focus();
    await flushUpdates();
    trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    const first = document.body.querySelector(
      '[data-slot="hover-card-content"] a'
    ) as HTMLElement;
    expect(document.activeElement).toBe(first);

    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );
    trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    expect(document.activeElement).toBe(trigger);

    trigger.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await flushUpdates();
    const reopenedFirst = document.body.querySelector(
      '[data-slot="hover-card-content"] a'
    ) as HTMLElement;
    reopenedFirst.focus();
    reopenedFirst.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );
    trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    expect(document.activeElement).toBe(trigger);
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).toBeNull();
  });
});
