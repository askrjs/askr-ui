import { describe, it } from 'vite-plus/test';
import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../../src/components/scroll-area';
import { expectNoAxeViolations } from '../../accessibility';

describe('ScrollArea - Accessibility', () => {
  it('should have no automated axe violations given a labelled viewport', async () => {
    await expectNoAxeViolations(
      <ScrollArea>
        <ScrollAreaViewport aria-label="Messages">Messages</ScrollAreaViewport>
        <ScrollAreaScrollbar aria-label="Message position">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    );
  });
});
