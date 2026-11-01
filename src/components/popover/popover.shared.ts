import { defineScope, readScope } from '@askrjs/askr';
import { composeRefs, type Ref } from '@askrjs/askr/foundations/utilities';
import { OVERLAY_Z_INDEX, type OverlayPortal } from '../_internal/overlay';
import type { PopoverContentOwnProps } from './popover.types';
import type { SsrIdRegistration } from '../_internal/ssr-id-association';

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
  ssrTrigger: SsrIdRegistration;
  ssrContent: SsrIdRegistration;
  portal: OverlayPortal;
  registerContentPosition: (position: PopoverPositionOptions) => void;
  setTriggerNode: (
    node: HTMLElement | null,
    automaticControls: boolean
  ) => void;
  getTriggerNode: () => HTMLElement | null;
  getContentNode: () => HTMLElement | null;
  isTriggerTarget: (target: EventTarget | null) => boolean;
  setContentNode: (node: HTMLElement | null, automaticLabel: boolean) => void;
  syncPosition: () => void;
  clearPosition: () => void;
};

export const PopoverRootContext = defineScope<PopoverRootContextValue | null>(
  null
);

/** Reads a host ref passed to an element used with an asChild Popover part. */
export function readPopoverChildRef(
  children: unknown
): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

/** Combines the refs owned by a Popover part with its asChild host ref. */
export function resolvePopoverSlotRef(
  asChild: boolean | undefined,
  children: unknown,
  ref: Ref<Element>
): Ref<Element> {
  if (!asChild) return ref;
  const childRef = readPopoverChildRef(children);
  if (ref == null && childRef == null) return undefined;
  return composeRefs(ref, childRef);
}

/** Removes ARIA values that are derived from Popover state. */
export function omitPopoverStateAriaProps<T extends object>(
  props: T,
  attributes: readonly string[]
): T {
  let result: T | undefined;
  for (const attribute of attributes) {
    if (!Object.prototype.hasOwnProperty.call(props, attribute)) continue;
    result ??= { ...props };
    delete (result as Record<string, unknown>)[attribute];
  }
  return result ?? props;
}

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
