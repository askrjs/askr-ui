import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../../_internal/types';
import type { OverlayAlign, OverlaySide } from '../../_internal/overlay';

export type HoverCardOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
};

export type HoverCardProps = HoverCardOwnProps;

export type HoverCardTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
>;
export type HoverCardTriggerAsChildProps = ButtonLikeAsChildProps;

export type HoverCardPortalProps = {
  children?: unknown;
};

export type HoverCardContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

export type HoverCardContentProps = BoxProps<'div', HTMLDivElement> &
  HoverCardContentOwnProps;

export type HoverCardContentAsChildProps = BoxAsChildProps &
  HoverCardContentOwnProps;

export type HoverCardAsChildProps = HoverCardOwnProps & {
  asChild: true;
  children: JSX.Element;
};
