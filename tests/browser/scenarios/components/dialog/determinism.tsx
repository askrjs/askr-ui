import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import { deterministicRender } from '../../_mount';

export function dialogMarkup() {
  return {
    renders: () => [
      deterministicRender('default open dialog', () => (
        <Dialog defaultOpen>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogPortal>
            <DialogContent>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )),
    ],
  };
}
