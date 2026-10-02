import {
  ScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../../../../src/components/scroll-area';
import { mount } from '../../_mount';

export function axeLabelledViewport(root: HTMLElement): void {
  mount(
    <ScrollArea>
      <ScrollAreaViewport aria-label="Messages">Messages</ScrollAreaViewport>
      <ScrollAreaScrollbar aria-label="Message position">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>,
    root
  );
}
