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

export type DropdownTriggerVariant = 'default' | 'ghost';
export type DropdownTriggerSize = 'md' | 'icon';

export type DropdownTriggerOwnProps = {
  variant?: DropdownTriggerVariant;
  size?: DropdownTriggerSize;
};

export type DropdownTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
> &
  DropdownTriggerOwnProps;
export type DropdownTriggerAsChildProps = ButtonLikeAsChildProps &
  DropdownTriggerOwnProps;

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
  variant?: DropdownItemVariant;
  onSelect?: (event: PressEvent) => void;
};

export type DropdownItemVariant = 'default' | 'destructive';

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
