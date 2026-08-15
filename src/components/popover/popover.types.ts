import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

/** Own props for Popover, before merging with native element attributes. */
export type PopoverOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Props for Popover. */
export type PopoverProps = PopoverOwnProps;

/** Props for Popover Trigger. */
export type PopoverTriggerProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Popover Trigger. */
export type PopoverTriggerAsChildProps = ButtonLikeAsChildProps;

/** Props for Popover Portal. */
export type PopoverPortalProps = {
  children?: unknown;
};

/** Popover Content Width. */
export type PopoverContentWidth = 'sm' | 'md' | 'lg';

/** Own props for Popover Content, before merging with native element attributes. */
export type PopoverContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
  width?: PopoverContentWidth;
};

/** Props for Popover Content. */
export type PopoverContentProps = BoxProps<'div', HTMLDivElement> &
  PopoverContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Popover Content. */
export type PopoverContentAsChildProps = BoxAsChildProps &
  PopoverContentOwnProps;

/** Props for Popover Close. */
export type PopoverCloseProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Popover Close. */
export type PopoverCloseAsChildProps = ButtonLikeAsChildProps;
