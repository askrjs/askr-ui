import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { OverlayHost } from '../../src/components/overlay-host';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../src/components/popover';
describe('Popover benches - default tree', () => {
  registerBench(
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
  registerBench(
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
  registerBench(
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
