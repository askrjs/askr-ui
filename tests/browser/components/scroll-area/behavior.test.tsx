import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../../src/components/scroll-area';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('ScrollArea - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should exposes canonical viewport and scrollbar hooks', async () => {
    container = mount(
      <ScrollArea>
        <ScrollAreaViewport>
          <div style={{ height: '200px' }}>Large content</div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
        <ScrollAreaCorner />
      </ScrollArea>
    );

    await flushUpdates();

    expect(
      container.querySelector('[data-slot="scroll-area-viewport"]')
    ).toBeTruthy();
    expect(
      container.querySelector('[data-slot="scroll-area-scrollbar"]')
    ).toBeTruthy();
    expect(
      container.querySelector('[data-slot="scroll-area-thumb"]')
    ).toBeTruthy();
    expect(
      container.querySelector('[data-slot="scroll-area-corner"]')
    ).toBeTruthy();
  });

  it('should does not emit inline viewport styles and rejects orphan parts', async () => {
    container = mount(
      <ScrollArea>
        <ScrollAreaViewport
          style={{
            overflowY: 'scroll',
            contain: 'paint',
          }}
        >
          <div>Content</div>
        </ScrollAreaViewport>
      </ScrollArea>
    );

    await flushUpdates();

    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;

    expect(viewport?.getAttribute('style')).toBeNull();

    expect(() =>
      ScrollAreaViewport({
        children: <div>Orphan</div>,
      } as never)
    ).toThrowError(/called during component render/);
  });

  it('should expose viewport and scrollbar accessibility semantics given vertical and horizontal orientations when the area mounts', async () => {
    container = mount(
      <ScrollArea id="messages">
        <ScrollAreaViewport>Messages</ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" />
        <ScrollAreaScrollbar orientation="horizontal" />
      </ScrollArea>
    );
    await flushUpdates();
    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement;
    const bars = [
      ...container.querySelectorAll('[data-slot="scroll-area-scrollbar"]'),
    ] as HTMLElement[];
    expect(viewport.getAttribute('role')).toBe('region');
    expect(bars.map((bar) => bar.getAttribute('role'))).toEqual([
      'scrollbar',
      'scrollbar',
    ]);
    expect(bars.map((bar) => bar.getAttribute('aria-orientation'))).toEqual([
      'vertical',
      'horizontal',
    ]);
    expect(
      bars.every((bar) => bar.getAttribute('aria-controls') === viewport.id)
    ).toBe(true);
  });

  it('should preserve consumer scroll handlers and refs given ScrollAreaViewport asChild when the viewport rerenders', async () => {
    const onScroll = vi.fn();
    const ref = { current: null as HTMLDivElement | null };
    container = mount(
      <ScrollArea>
        <ScrollAreaViewport asChild ref={ref} onScroll={onScroll}>
          <div>Messages</div>
        </ScrollAreaViewport>
      </ScrollArea>
    );
    await flushUpdates();
    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLDivElement;
    viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
    expect(ref.current).toBe(viewport);
    expect(onScroll).toHaveBeenCalledOnce();
  });

  it('should synchronize range state and keyboard scrolling given overflow', async () => {
    container = mount(
      <>
        <style>
          {`[data-testid="metrics-viewport"] {
            width: 200px;
            height: 100px;
            overflow: scroll;
          }`}
        </style>
        <ScrollArea id="metrics">
          <ScrollAreaViewport data-testid="metrics-viewport">
            <div style={{ width: '600px', height: '500px' }}>Messages</div>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar orientation="vertical">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
          <ScrollAreaScrollbar orientation="horizontal">
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </ScrollArea>
      </>
    );
    await flushUpdates();
    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement;
    viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
    await flushUpdates();
    let bars = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-slot="scroll-area-scrollbar"]'
      )
    );
    expect(bars[0]?.id).not.toBe(bars[1]?.id);
    expect(bars[0]?.getAttribute('aria-valuemin')).toBe('0');
    expect(bars[0]?.getAttribute('aria-valuemax')).toBe('100');
    expect(bars[0]?.getAttribute('aria-valuenow')).toBe('0');
    expect(bars[0]?.tabIndex).toBe(0);

    bars[0]?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    bars = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-slot="scroll-area-scrollbar"]'
      )
    );
    expect(viewport.scrollTop).toBeCloseTo(40, 0);
    expect(bars[0]?.getAttribute('aria-valuenow')).toBe('10');

    bars[0]?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      })
    );
    await flushUpdates();
    bars = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-slot="scroll-area-scrollbar"]'
      )
    );
    expect(viewport.scrollTop).toBe(400);
    expect(bars[0]?.getAttribute('aria-valuenow')).toBe('100');
  });
});
