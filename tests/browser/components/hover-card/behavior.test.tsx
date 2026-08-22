import { userEvent } from '@vitest/browser/context';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { flush as flushScheduler } from '@askrjs/askr/testing';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import { flushUpdates, mount, unmount } from '../../test-utils';

async function advanceHoverCardTimers(milliseconds: number): Promise<void> {
  flushScheduler();
  await flushUpdates();
  flushScheduler();
  await vi.advanceTimersByTimeAsync(milliseconds);
  flushScheduler();
  await flushUpdates();
  flushScheduler();
}

async function waitForHoverCardState(
  container: HTMLElement,
  expected: 'open' | 'closed'
): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    flushScheduler();
    await flushUpdates();
    flushScheduler();
    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement | null;
    if (trigger?.getAttribute('data-state') === expected) {
      return trigger;
    }
  }

  throw new Error(`Expected HoverCard trigger to become ${expected}`);
}

function getPointerExitTarget(): HTMLElement {
  const existing = document.querySelector(
    '[data-hover-card-pointer-exit]'
  ) as HTMLElement | null;
  if (existing) {
    return existing;
  }
  const target = document.createElement('button');
  target.setAttribute('data-hover-card-pointer-exit', 'true');
  target.style.position = 'fixed';
  target.style.right = '0';
  target.style.bottom = '0';
  target.style.width = '2px';
  target.style.height = '2px';
  target.style.zIndex = '2147483647';
  document.body.appendChild(target);
  return target;
}

describe('HoverCard - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    unmount(container);
    document.querySelector('[data-hover-card-pointer-exit]')?.remove();
    container = undefined;
  });

  it('should open and close from hover and focus state changes', async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();

    container = mount(
      <HoverCard onOpenChange={onOpenChange}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    let trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;

    await userEvent.hover(trigger);
    await flushUpdates();
    await advanceHoverCardTimers(1);

    const openTrigger = await waitForHoverCardState(container, 'open');

    expect(openTrigger.getAttribute('data-state')).toBe('open');
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();

    await userEvent.hover(getPointerExitTarget());
    await flushUpdates();
    await advanceHoverCardTimers(90);
    const closedTrigger = await waitForHoverCardState(container, 'closed');

    expect(closedTrigger.getAttribute('data-state')).toBe('closed');
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('should support asChild composition and ref forwarding', async () => {
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
    const content = document.body.querySelector(
      '[data-slot="hover-card-content"]'
    ) as HTMLElement;
    await userEvent.hover(content);
    await advanceHoverCardTimers(60);
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();
  });

  it('should cancel a pending open when the pointer leaves immediately', async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    container = mount(
      <HoverCard openDelay={0} closeDelay={90} onOpenChange={onOpenChange}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    await userEvent.hover(trigger);
    await userEvent.hover(getPointerExitTarget());

    await advanceHoverCardTimers(100);

    const currentTrigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    expect(currentTrigger.getAttribute('data-state')).toBe('closed');
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should cancel a pending close when the pointer re-enters before its deadline', async () => {
    vi.useFakeTimers();
    container = mount(
      <HoverCard defaultOpen closeDelay={90}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );
    await flushUpdates();

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    await userEvent.hover(getPointerExitTarget());
    await advanceHoverCardTimers(40);
    await userEvent.hover(trigger);
    await advanceHoverCardTimers(60);

    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();
  });

  it('should honor the final pointer state through repeated timer churn', async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    container = mount(
      <HoverCard openDelay={20} closeDelay={90} onOpenChange={onOpenChange}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await userEvent.hover(trigger);
      await advanceHoverCardTimers(10);
      await userEvent.hover(getPointerExitTarget());
      await advanceHoverCardTimers(10);
    }
    await userEvent.hover(trigger);

    await advanceHoverCardTimers(100);

    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[true]]);
  });

  it('should cancel both transition timers during teardown', async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    container = mount(
      <HoverCard openDelay={50} closeDelay={50} onOpenChange={onOpenChange}>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    await userEvent.hover(trigger);
    unmount(container);
    container = undefined;

    await advanceHoverCardTimers(100);
    expect(onOpenChange).not.toHaveBeenCalled();
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

  it('should allow a later focus open when the restoration frame is throttled', async () => {
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1);
    container = mount(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>
          <button>Action</button>
        </HoverCardContent>
      </HoverCard>
    );
    await flushUpdates();

    const action = document.body.querySelector(
      '[data-slot="hover-card-content"] button'
    ) as HTMLButtonElement;
    action.focus();
    action.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;
    expect(requestFrame).toHaveBeenCalled();
    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).toBeNull();

    trigger.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await flushUpdates();

    expect(
      document.body.querySelector('[data-slot="hover-card-content"]')
    ).not.toBeNull();
  });
});
