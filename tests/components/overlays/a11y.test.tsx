import { describe, it } from 'vitest';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../src/components/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../../src/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../src/components/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../src/components/tooltip';
import { expectNoAxeViolations } from '../../accessibility';

describe('Overlay Components - Accessibility', () => {
  it('has no axe violations for Dialog', async () => {
    await expectNoAxeViolations(
      <Dialog defaultOpen>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogContent>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  });

  it('has no axe violations for AlertDialog', async () => {
    await expectNoAxeViolations(
      <AlertDialog defaultOpen>
        <AlertDialogTrigger>Open alert</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Alert title</AlertDialogTitle>
            <AlertDialogDescription>Alert description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    );
  });

  it('has no axe violations for Popover', async () => {
    await expectNoAxeViolations(
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent aria-label="Popover body">
            Popover body
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    );
  });

  it('has no axe violations for Tooltip', async () => {
    await expectNoAxeViolations(
      <Tooltip defaultOpen>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Helpful text</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    );
  });
});
