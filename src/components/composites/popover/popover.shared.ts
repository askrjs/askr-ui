import { defineContext, readContext } from '@askrjs/askr';
import type { OverlayPortal } from '../../_internal/overlay';
import type { PopoverContentOwnProps } from './popover.types';

export type PopoverPositionOptions = {
  side: NonNullable<PopoverContentOwnProps['side']>;
  align: NonNullable<PopoverContentOwnProps['align']>;
  sideOffset: NonNullable<PopoverContentOwnProps['sideOffset']>;
  zIndex: 50;
};

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

export const PopoverRootContext = defineContext<PopoverRootContextValue | null>(
  null
);

export function readPopoverRootContext(): PopoverRootContextValue {
  const context = readContext(PopoverRootContext);

  if (!context) {
    throw new Error('Popover components must be used within <Popover>');
  }

  return context;
}

export function resolvePopoverPositionOptions(
  options: Partial<Omit<PopoverPositionOptions, 'zIndex'>> = {}
): PopoverPositionOptions {
  return {
    side: options.side ?? 'bottom',
    align: options.align ?? 'center',
    sideOffset: options.sideOffset ?? 0,
    zIndex: 50,
  };
}
