import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '../../src/components/scroll-area';
describe('ScrollArea benches - shell', () => {
  registerBench(
    'SSR render scroll area shell',
    () => {
      renderToStringSync(() => (
        <ScrollArea
          {...{
            children: [
              <ScrollAreaViewport
                {...{
                  children: (
                    <div style={{ height: '200px' }}>Large content</div>
                  ),
                }}
              />,
              <ScrollAreaScrollbar
                {...{
                  orientation: 'vertical',
                  children: <ScrollAreaThumb {...{}} />,
                }}
              />,
              <ScrollAreaCorner {...{}} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('ScrollArea benches - asChild viewport', () => {
  registerBench(
    'SSR render scroll area with asChild viewport',
    () => {
      renderToStringSync(() => (
        <ScrollArea
          {...{
            children: [
              <ScrollAreaViewport
                {...{
                  asChild: true,
                  children: <section>Large content</section>,
                }}
              />,
              <ScrollAreaScrollbar
                {...{
                  orientation: 'vertical',
                  children: <ScrollAreaThumb {...{}} />,
                }}
              />,
              <ScrollAreaCorner {...{}} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
