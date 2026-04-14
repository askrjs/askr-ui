import { bench, describe } from 'vite-plus/test';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogPortal,
  AlertDialogTrigger,
} from '../../src/components';
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from '../../src/components';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../src/components';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../src/components';

describe('Overlay benches', () => {
  bench('create Dialog tree', () => {
    Dialog({
      defaultOpen: true,
      children: (
        <>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogPortal>
            <DialogContent>Body</DialogContent>
          </DialogPortal>
        </>
      ),
    });
  });

  bench('create AlertDialog tree', () => {
    AlertDialog({
      defaultOpen: true,
      children: (
        <>
          <AlertDialogTrigger>Open alert</AlertDialogTrigger>
          <AlertDialogPortal>
            <AlertDialogContent>Body</AlertDialogContent>
          </AlertDialogPortal>
        </>
      ),
    });
  });

  bench('create Popover tree', () => {
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

  bench('create Tooltip tree', () => {
    Tooltip({
      defaultOpen: true,
      children: (
        <>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Body</TooltipContent>
          </TooltipPortal>
        </>
      ),
    });
  });
});
