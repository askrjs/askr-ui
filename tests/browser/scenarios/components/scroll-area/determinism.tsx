import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../../../src/components/scroll-area';
import { deterministicRender } from '../../_mount';

export function scrollAreaMarkup() {
  return {
    renders: () => [
      deterministicRender(
        'scroll area with vertical and horizontal bars',
        () => (
          <ScrollArea id="messages">
            <ScrollAreaViewport>Messages</ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
            <ScrollAreaScrollbar orientation="horizontal">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        )
      ),
    ],
  };
}
