import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../../src/components/alert-dialog';
import { deterministicRender } from '../../_mount';

export function alertDialogMarkup() {
  return {
    renders: () => [
      deterministicRender('default open alert dialog', () => (
        <AlertDialog defaultOpen>
          <AlertDialogTrigger>Open alert</AlertDialogTrigger>
          <AlertDialogPortal>
            <AlertDialogContent>
              <AlertDialogTitle>Alert title</AlertDialogTitle>
              <AlertDialogDescription>Alert description</AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      )),
    ],
  };
}
