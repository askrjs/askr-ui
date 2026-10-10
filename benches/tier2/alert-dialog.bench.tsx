import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../src/components/alert-dialog';
describe('AlertDialog benches', () => {
  bench(
    'SSR render alert dialog tree',
    () => {
      renderToStringSync(() => (
        <AlertDialog
          {...{
            defaultOpen: true,
            children: (
              <>
                <AlertDialogTrigger>Open alert</AlertDialogTrigger>
                <AlertDialogPortal>
                  <AlertDialogOverlay />
                  <AlertDialogContent>
                    <AlertDialogTitle>Confirm</AlertDialogTitle>
                    <AlertDialogDescription>Body</AlertDialogDescription>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialogPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render alert dialog tree with asChild content',
    () => {
      renderToStringSync(() => (
        <AlertDialog
          {...{
            defaultOpen: true,
            children: (
              <>
                <AlertDialogTrigger>Open alert</AlertDialogTrigger>
                <AlertDialogPortal>
                  <AlertDialogOverlay />
                  <AlertDialogContent asChild>
                    <section aria-label="Confirm action">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </section>
                  </AlertDialogContent>
                </AlertDialogPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
