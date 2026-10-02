import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../../src/components/alert-dialog';
import { mount } from '../../_mount';

export function axeOpenAlertDialog(root: HTMLElement): void {
  mount(
    <AlertDialog defaultOpen>
      <AlertDialogTrigger>Open alert</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent>
          <AlertDialogTitle>Alert title</AlertDialogTitle>
          <AlertDialogDescription>Alert description</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>,
    root
  );
}
