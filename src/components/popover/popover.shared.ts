import { defineScope, readScope } from '@askrjs/askr';
import { OVERLAY_Z_INDEX, type OverlayPortal } from '../_internal/overlay';
import type { PopoverContentOwnProps } from './popover.types';

/** Popover Position Options. */
export type PopoverPositionOptions = {
  side: NonNullable<PopoverContentOwnProps['side']>;
  align: NonNullable<PopoverContentOwnProps['align']>;
  sideOffset: NonNullable<PopoverContentOwnProps['sideOffset']>;
  zIndex: typeof OVERLAY_Z_INDEX.popover;
};

/** Shape of the Popover Root Context Value. */
export type PopoverRootContextValue = {
  popoverId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
  portal: OverlayPortal;
  registerContentPosition: (position: PopoverPositionOptions) => void;
  setTriggerNode: (node: HTMLElement | null) => void;
  setContentNode: (node: HTMLElement | null) => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const PopoverRootContext = defineScope<PopoverRootContextValue | null>(
  null
);

/**
 * Reads the Popover Root Context; throws if called outside its provider.
 */
export function readPopoverRootContext(): PopoverRootContextValue {
  const context = readScope(PopoverRootContext);

  if (!context) {
    throw new Error('Popover components must be used within <Popover>');
  }

  return context;
}

/**
 * Builds overlay positioning options for Popover Position Options.
 */
export function resolvePopoverPositionOptions(
  options: Partial<Omit<PopoverPositionOptions, 'zIndex'>> = {}
): PopoverPositionOptions {
  return {
    side: options.side ?? 'bottom',
    align: options.align ?? 'center',
    sideOffset: options.sideOffset ?? 0,
    zIndex: OVERLAY_Z_INDEX.popover,
  };
}
