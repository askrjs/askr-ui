import { defineScope, readScope } from '@askrjs/askr';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import type { SsrIdRegistration } from '../_internal/ssr-id-association';
import { isJsxElement } from '../_internal/jsx';
import { OVERLAY_Z_INDEX, type OverlayPortal } from '../_internal/overlay';
import type { TooltipContentOwnProps } from './tooltip.types';

/** Tooltip Position Options. */
export type TooltipPositionOptions = {
  side: NonNullable<TooltipContentOwnProps['side']>;
  align: NonNullable<TooltipContentOwnProps['align']>;
  sideOffset: NonNullable<TooltipContentOwnProps['sideOffset']>;
  zIndex: typeof OVERLAY_Z_INDEX.tooltip;
};

/** Shape of the Tooltip Root Context Value. */
export type TooltipRootContextValue = {
  tooltipId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  openFromFocus: () => void;
  releaseFocusAdoption: () => void;
  getTriggerNode: () => HTMLElement | null;
  contentId: string;
  ssrContent: SsrIdRegistration;
  portal: OverlayPortal;
  registerContentPosition: (position: TooltipPositionOptions) => void;
  setTriggerNode: (
    node: HTMLElement | null,
    automaticDescription: boolean
  ) => void;
  setContentNode: (node: HTMLElement | null) => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const TooltipRootContext = defineScope<TooltipRootContextValue | null>(
  null
);

/** Reads the host ref on an element composed through an asChild Tooltip part. */
export function readTooltipChildRef(
  children: unknown
): Ref<HTMLElement> | undefined {
  if (!isJsxElement(children)) return undefined;
  return children.props.ref as Ref<HTMLElement> | undefined;
}

/**
 * Reads the Tooltip Root Context; throws if called outside its provider.
 */
export function readTooltipRootContext(): TooltipRootContextValue {
  const context = readScope(TooltipRootContext);

  if (!context) {
    throw new Error('Tooltip components must be used within <Tooltip>');
  }

  return context;
}

/**
 * Builds overlay positioning options for Tooltip Position Options.
 */
export function resolveTooltipPositionOptions(
  options: Partial<Omit<TooltipPositionOptions, 'zIndex'>> = {}
): TooltipPositionOptions {
  return {
    side: options.side ?? 'top',
    align: options.align ?? 'center',
    sideOffset: options.sideOffset ?? 0,
    zIndex: OVERLAY_Z_INDEX.tooltip,
  };
}
