import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../src/components/composites/scroll-area';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('ScrollArea - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('exposes canonical viewport and scrollbar hooks', async () => {
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

  it('merges viewport styles and rejects orphan parts', async () => {
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

    expect(viewport?.style.display).toBe('block');
    expect(viewport?.style.overflowY).toBe('scroll');
    expect(viewport?.style.contain).toBe('paint');
    expect(viewport?.style.width).toBe('100%');

    expect(() =>
      ScrollAreaViewport({
        children: <div>Orphan</div>,
      } as never)
    ).toThrowError(/called during component render/);
  });
});
