import { defineContext, readContext } from '@askrjs/askr';
import type { OverlayPortal } from '../../_internal/overlay';

export type HoverCardPositionOptions = {
  mode?: 'anchored';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  viewportPadding?: number;
  zIndex?: number;
};

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
  syncPosition: () => void;
  clearPosition: () => void;
};

export const HoverCardRootContext = defineContext<HoverCardRootContextValue | null>(null);

export function readHoverCardRootContext(): HoverCardRootContextValue {
  const context = readContext(HoverCardRootContext);

  if (!context) {
    throw new Error('HoverCard components must be used within <HoverCard>');
  }

  return context;
}

export function resolveHoverCardPositionOptions(
  position: HoverCardPositionOptions = {}
): Required<HoverCardPositionOptions> {
  return {
    mode: 'anchored',
    side: position.side ?? 'bottom',
    align: position.align ?? 'center',
    sideOffset: position.sideOffset ?? 6,
    viewportPadding: position.viewportPadding ?? 12,
    zIndex: position.zIndex ?? 40,
  };
}
