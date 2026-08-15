import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

/** Own props for Hover Card, before merging with native element attributes. */
export type HoverCardOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
};

/** Props for Hover Card. */
export type HoverCardProps = HoverCardOwnProps;

/** Props for Hover Card Trigger. */
export type HoverCardTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
>;
/** Props for the `asChild` (polymorphic) rendering of Hover Card Trigger. */
export type HoverCardTriggerAsChildProps = ButtonLikeAsChildProps;

/** Props for Hover Card Portal. */
export type HoverCardPortalProps = {
  children?: unknown;
};

/** Own props for Hover Card Content, before merging with native element attributes. */
export type HoverCardContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

/** Props for Hover Card Content. */
export type HoverCardContentProps = BoxProps<'div', HTMLDivElement> &
  HoverCardContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Hover Card Content. */
export type HoverCardContentAsChildProps = BoxAsChildProps &
  HoverCardContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Hover Card. */
export type HoverCardAsChildProps = HoverCardOwnProps & {
  asChild: true;
  children: JSX.Element;
};
