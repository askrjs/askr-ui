import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import { mount } from '../../_mount';

export function axeOpenDialog(root: HTMLElement): void {
  mount(
    <Dialog defaultOpen>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
    root
  );
}
