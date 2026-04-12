import { defineContext, readContext } from '@askrjs/askr';
import type { OverlayPortal } from '../../_internal/overlay';

export type DialogPositionOptions = {
  mode: 'centered';
  viewportPadding: 20;
  zIndex: 50;
};

export type DialogRootContextValue = {
  dialogId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  modal: boolean;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  portal: OverlayPortal;
  setTriggerNode: (node: HTMLElement | null) => void;
  setContentNode: (node: HTMLElement | null) => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const DialogRootContext =
  defineContext<DialogRootContextValue | null>(null);

export function readDialogRootContext(): DialogRootContextValue {
  const context = readContext(DialogRootContext);

  if (!context) {
    throw new Error('Dialog components must be used within <Dialog>');
  }

  return context;
}

export function resolveDialogPositionOptions(): DialogPositionOptions {
  return {
    mode: 'centered',
    viewportPadding: 20,
    zIndex: 50,
  };
}