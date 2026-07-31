import { describe, it } from 'vite-plus/test';
import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../../src/components/scroll-area';
import { expectDeterministicRender } from '../../determinism';

describe('ScrollArea - Determinism', () => {
  it('should render deterministic IDs and range markup', () => {
    expectDeterministicRender(() => (
      <ScrollArea id="messages">
        <ScrollAreaViewport>Messages</ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
        <ScrollAreaScrollbar orientation="horizontal">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    ));
  });
});
