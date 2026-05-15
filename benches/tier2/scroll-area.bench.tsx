import { bench, describe } from 'vite-plus/test';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../src/components/scroll-area';

describe('ScrollArea benches - shell', () => {
  bench('create scroll area shell', () => {
    ScrollArea({
      children: [
        ScrollAreaViewport({
          children: <div style={{ height: '200px' }}>Large content</div>,
        }),
        ScrollAreaScrollbar({
          orientation: 'vertical',
          children: ScrollAreaThumb({}),
        }),
        ScrollAreaCorner({}),
      ],
    });
  });
});

describe('ScrollArea benches - asChild viewport', () => {
  bench('create scroll area with asChild viewport', () => {
    ScrollArea({
      children: [
        ScrollAreaViewport({
          asChild: true,
          children: <section>Large content</section>,
        }),
        ScrollAreaScrollbar({
          orientation: 'vertical',
          children: ScrollAreaThumb({}),
        }),
        ScrollAreaCorner({}),
      ],
    });
  });
});
