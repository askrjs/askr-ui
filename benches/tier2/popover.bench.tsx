import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { OverlayHost } from '../../src/components/overlay-host';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../src/components/popover';
describe('Popover benches - default tree', () => {
  bench(
    'SSR render popover tree',
    () => {
      renderToStringSync(() => (
        <Popover
          {...{
            defaultOpen: true,
            children: (
              <>
                <PopoverTrigger>Open popover</PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent>Body</PopoverContent>
                </PopoverPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('OverlayHost benches - hosted popover tree', () => {
  bench(
    'SSR render overlay host with popover tree',
    () => {
      renderToStringSync(() => (
        <OverlayHost
          {...{
            children: (
              <Popover defaultOpen>
                <PopoverTrigger>Open popover</PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent>Body</PopoverContent>
                </PopoverPortal>
              </Popover>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Popover benches - asChild content', () => {
  bench(
    'SSR render popover tree with asChild content',
    () => {
      renderToStringSync(() => (
        <Popover
          {...{
            defaultOpen: true,
            children: (
              <>
                <PopoverTrigger>Open popover</PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent asChild>
                    <section>
                      Body
                      <PopoverClose>Close</PopoverClose>
                    </section>
                  </PopoverContent>
                </PopoverPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
