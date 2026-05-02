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
});
