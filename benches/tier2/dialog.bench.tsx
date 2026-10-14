import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../src/components/dialog';
describe('Dialog benches - default tree', () => {
  bench(
    'SSR render dialog tree',
    () => {
      renderToStringSync(() => (
        <Dialog
          {...{
            defaultOpen: true,
            children: (
              <>
                <DialogTrigger>Open dialog</DialogTrigger>
                <DialogPortal>
                  <DialogOverlay />
                  <DialogContent>
                    <DialogTitle>Title</DialogTitle>
                    <DialogDescription>Body</DialogDescription>
                    <DialogClose>Close</DialogClose>
                  </DialogContent>
                </DialogPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Dialog benches - asChild content', () => {
  bench(
    'SSR render dialog tree with asChild content',
    () => {
      renderToStringSync(() => (
        <Dialog
          {...{
            defaultOpen: true,
            children: (
              <>
                <DialogTrigger>Open dialog</DialogTrigger>
                <DialogPortal>
                  <DialogOverlay />
                  <DialogContent asChild>
                    <section aria-label="Preferences">
                      Body
                      <DialogClose>Close</DialogClose>
                    </section>
                  </DialogContent>
                </DialogPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
