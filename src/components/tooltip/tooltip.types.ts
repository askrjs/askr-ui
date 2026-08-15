import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

/** Own props for Tooltip, before merging with native element attributes. */
export type TooltipOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Props for Tooltip. */
export type TooltipProps = TooltipOwnProps;

/** Props for Tooltip Trigger. */
export type TooltipTriggerProps = ButtonLikeProps<'button', HTMLButtonElement>;
/** Props for the `asChild` (polymorphic) rendering of Tooltip Trigger. */
export type TooltipTriggerAsChildProps = ButtonLikeAsChildProps;

/** Props for Tooltip Portal. */
export type TooltipPortalProps = {
  children?: unknown;
};

/** Own props for Tooltip Content, before merging with native element attributes. */
export type TooltipContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

/** Props for Tooltip Content. */
export type TooltipContentProps = BoxProps<'div', HTMLDivElement> &
  TooltipContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Tooltip Content. */
export type TooltipContentAsChildProps = BoxAsChildProps &
  TooltipContentOwnProps;
