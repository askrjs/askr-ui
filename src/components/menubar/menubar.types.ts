import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

export type MenubarOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  loop?: boolean;
};

export type MenubarProps = BoxProps<'div', HTMLDivElement> & MenubarOwnProps;

export type MenubarMenuProps = {
  children?: unknown;
  /** Stable and unique among sibling menus when menus are rendered dynamically. */
  value?: string;
};

export type MenubarTextValueOwnProps = {
  /** Text used for typeahead when rendered children are not plain text. */
  textValue?: string;
};

export type MenubarTriggerProps = ButtonLikeProps<'button', HTMLButtonElement> &
  MenubarTextValueOwnProps;
export type MenubarTriggerAsChildProps = ButtonLikeAsChildProps &
  MenubarTextValueOwnProps;

export type MenubarPortalProps = {
  children?: unknown;
};

export type MenubarContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

export type MenubarContentProps = BoxProps<'div', HTMLDivElement> &
  MenubarContentOwnProps;
export type MenubarContentAsChildProps = BoxAsChildProps &
  MenubarContentOwnProps;

export type MenubarItemProps = ButtonLikeProps<'button', HTMLButtonElement> &
  MenubarTextValueOwnProps;
export type MenubarItemAsChildProps = ButtonLikeAsChildProps &
  MenubarTextValueOwnProps;

export type MenubarGroupProps = BoxProps<'div', HTMLDivElement>;
export type MenubarGroupAsChildProps = BoxAsChildProps;

export type MenubarLabelProps = BoxProps<'div', HTMLDivElement>;
export type MenubarLabelAsChildProps = BoxAsChildProps;

export type MenubarSeparatorProps = BoxProps<'div', HTMLDivElement>;
export type MenubarSeparatorAsChildProps = BoxAsChildProps;

export type MenubarSubProps = {
  children?: unknown;
  value?: string;
};

export type MenubarSubTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
> &
  MenubarTextValueOwnProps;
export type MenubarSubTriggerAsChildProps = ButtonLikeAsChildProps &
  MenubarTextValueOwnProps;

export type MenubarSubContentProps = BoxProps<'div', HTMLDivElement> &
  MenubarContentOwnProps;
export type MenubarSubContentAsChildProps = BoxAsChildProps &
  MenubarContentOwnProps;
