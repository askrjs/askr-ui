import { bench, describe } from 'vite-plus/test';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../src/components/popover';

describe('Popover benches - default tree', () => {
  bench('create popover tree', () => {
    Popover({
      defaultOpen: true,
      children: (
        <>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent>Body</PopoverContent>
          </PopoverPortal>
        </>
      ),
    });
  });
});

describe('Popover benches - asChild content', () => {
  bench('create popover tree with asChild content', () => {
    Popover({
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
    });
  });
});
