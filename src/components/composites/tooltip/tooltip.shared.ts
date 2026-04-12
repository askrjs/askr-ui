import { defineContext, readContext } from '@askrjs/askr';
import type { OverlayPortal } from '../../_internal/overlay';
import type { TooltipContentOwnProps } from './tooltip.types';

export type TooltipPositionOptions = {
  side: NonNullable<TooltipContentOwnProps['side']>;
  align: NonNullable<TooltipContentOwnProps['align']>;
  sideOffset: NonNullable<TooltipContentOwnProps['sideOffset']>;
  zIndex: 60;
};

export type TooltipRootContextValue = {
  tooltipId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  portal: OverlayPortal;
  registerContentPosition: (position: TooltipPositionOptions) => void;
  setTriggerNode: (node: HTMLElement | null) => void;
  setContentNode: (node: HTMLElement | null) => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const TooltipRootContext =
  defineContext<TooltipRootContextValue | null>(null);

export function readTooltipRootContext(): TooltipRootContextValue {
  const context = readContext(TooltipRootContext);

  if (!context) {
    throw new Error('Tooltip components must be used within <Tooltip>');
  }

  return context;
}

export function resolveTooltipPositionOptions(
  options: Partial<Omit<TooltipPositionOptions, 'zIndex'>> = {}
): TooltipPositionOptions {
  return {
    side: options.side ?? 'top',
    align: options.align ?? 'center',
    sideOffset: options.sideOffset ?? 0,
    zIndex: 60,
  };
}
