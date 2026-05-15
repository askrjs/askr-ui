import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
  PressEvent,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

export type DropdownOwnProps = {
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DropdownProps = DropdownOwnProps;

export type DropdownTriggerProps = ButtonLikeProps<'button', HTMLButtonElement>;
export type DropdownTriggerAsChildProps = ButtonLikeAsChildProps;

export type DropdownPortalProps = {
  children?: unknown;
};

export type DropdownContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

export type DropdownContentProps = BoxProps<'div', HTMLDivElement> &
  DropdownContentOwnProps;

export type DropdownContentAsChildProps = BoxAsChildProps &
  DropdownContentOwnProps;

export type DropdownItemOwnProps = {
  children?: unknown;
  disabled?: boolean;
  onSelect?: (event: PressEvent) => void;
};

export type DropdownItemProps = Omit<
  ButtonLikeProps<'button', HTMLButtonElement>,
  'onPress'
> &
  DropdownItemOwnProps;

export type DropdownItemAsChildProps = Omit<ButtonLikeAsChildProps, 'onPress'> &
  DropdownItemOwnProps;

export type DropdownGroupProps = BoxProps<'div', HTMLDivElement>;
export type DropdownGroupAsChildProps = BoxAsChildProps;

export type DropdownLabelProps = BoxProps<'div', HTMLDivElement>;
export type DropdownLabelAsChildProps = BoxAsChildProps;

export type DropdownSeparatorProps = BoxProps<'div', HTMLDivElement>;
export type DropdownSeparatorAsChildProps = BoxAsChildProps;
