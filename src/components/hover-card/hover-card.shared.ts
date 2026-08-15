import { defineScope, readScope } from '@askrjs/askr';
import {
  OVERLAY_Z_INDEX,
  type OverlayPortal,
  type OverlayZIndex,
} from '../_internal/overlay';

/** Hover Card Position Options. */
export type HoverCardPositionOptions = {
  mode?: 'anchored';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  viewportPadding?: number;
  zIndex?: OverlayZIndex;
};

/** Shape of the Hover Card Root Context Value. */
export type HoverCardRootContextValue = {
  hoverCardId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  scheduleOpen: () => void;
  scheduleClose: () => void;
  cancelClose: () => void;
  triggerId: string;
  contentId: string;
  portal: OverlayPortal;
  registerContentPosition: (position: HoverCardPositionOptions) => void;
  setTriggerNode: (node: HTMLElement | null) => void;
  setContentNode: (node: HTMLElement | null) => void;
  getTriggerNode: () => HTMLElement | null;
  getContentNode: () => HTMLElement | null;
  requestTriggerFocus: () => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const HoverCardRootContext =
  defineScope<HoverCardRootContextValue | null>(null);

/**
 * Reads the Hover Card Root Context; throws if called outside its provider.
 */
export function readHoverCardRootContext(): HoverCardRootContextValue {
  const context = readScope(HoverCardRootContext);

  if (!context) {
    throw new Error('HoverCard components must be used within <HoverCard>');
  }

  return context;
}

/**
 * Builds overlay positioning options for Hover Card Position Options.
 */
export function resolveHoverCardPositionOptions(
  position: HoverCardPositionOptions = {}
): Required<HoverCardPositionOptions> {
  return {
    mode: 'anchored',
    side: position.side ?? 'bottom',
    align: position.align ?? 'center',
    sideOffset: position.sideOffset ?? 6,
    viewportPadding: position.viewportPadding ?? 12,
    zIndex: position.zIndex ?? OVERLAY_Z_INDEX.popover,
  };
}
