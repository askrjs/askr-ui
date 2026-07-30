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
});
