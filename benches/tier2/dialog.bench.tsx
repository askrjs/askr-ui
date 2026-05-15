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
  bench('create dialog tree', () => {
    Dialog({
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
    });
  });
});

describe('Dialog benches - asChild content', () => {
  bench('create dialog tree with asChild content', () => {
    Dialog({
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
    });
  });
});
