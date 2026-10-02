import { defineScope, readScope } from '@askrjs/askr';
import { OVERLAY_Z_INDEX, type OverlayPortal } from '../_internal/overlay';
import type { SsrIdRegistration } from '../_internal/ssr-id-association';

/** Dialog Position Options. */
export type DialogPositionOptions = {
  mode: 'centered';
  viewportPadding: 20;
  zIndex: typeof OVERLAY_Z_INDEX.modal;
};

/** Shape of the Dialog Root Context Value. */
export type DialogRootContextValue = {
  dialogId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  modal: boolean;
  contentId: string;
  titleId: string;
  descriptionId: string;
  ssrTitle: SsrIdRegistration;
  ssrDescription: SsrIdRegistration;
  ssrContent: SsrIdRegistration;
  getContentId: () => string | undefined;
  getTitleId: () => string | undefined;
  getDescriptionId: () => string | undefined;
  portal: OverlayPortal;
  backdropStackId: string;
  setTitleNode: (node: HTMLElement | null) => void;
  setDescriptionNode: (node: HTMLElement | null) => void;
  setTriggerNode: (
    node: HTMLElement | null,
    automaticControls: boolean
  ) => void;
  getTriggerNode: () => HTMLElement | null;
  getContentNode: () => HTMLElement | null;
  setContentNode: (
    node: HTMLElement | null,
    associations: { title: boolean; description: boolean }
  ) => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const DialogRootContext = defineScope<DialogRootContextValue | null>(
  null
);

/**
 * Reads the Dialog Root Context; throws if called outside its provider.
 */
export function readDialogRootContext(): DialogRootContextValue {
  const context = readScope(DialogRootContext);

  if (!context) {
    throw new Error('Dialog components must be used within <Dialog>');
  }

  return context;
}

/**
 * Builds overlay positioning options for Dialog Position Options.
 */
export function resolveDialogPositionOptions(): DialogPositionOptions {
  return {
    mode: 'centered',
    viewportPadding: 20,
    zIndex: OVERLAY_Z_INDEX.modal,
  };
}
