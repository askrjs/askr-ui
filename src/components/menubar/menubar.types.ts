import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

/** Own props for Menubar, before merging with native element attributes. */
export type MenubarOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  loop?: boolean;
};

/** Props for Menubar. */
export type MenubarProps = BoxProps<'div', HTMLDivElement> & MenubarOwnProps;

/** Props for Menubar Menu. */
export type MenubarMenuProps = {
  children?: unknown;
  /** Stable and unique among sibling menus when menus are rendered dynamically. */
  value?: string;
};

/** Own props for Menubar Text Value, before merging with native element attributes. */
export type MenubarTextValueOwnProps = {
  /** Text used for typeahead when rendered children are not plain text. */
  textValue?: string;
};

/** Props for Menubar Trigger. */
export type MenubarTriggerProps = ButtonLikeProps<'button', HTMLButtonElement> &
  MenubarTextValueOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Menubar Trigger. */
export type MenubarTriggerAsChildProps = ButtonLikeAsChildProps &
  MenubarTextValueOwnProps;

/** Props for Menubar Portal. */
export type MenubarPortalProps = {
  children?: unknown;
};

/** Own props for Menubar Content, before merging with native element attributes. */
export type MenubarContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

/** Props for Menubar Content. */
export type MenubarContentProps = BoxProps<'div', HTMLDivElement> &
  MenubarContentOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Menubar Content. */
export type MenubarContentAsChildProps = BoxAsChildProps &
  MenubarContentOwnProps;

/** Props for Menubar Item. */
export type MenubarItemProps = ButtonLikeProps<'button', HTMLButtonElement> &
  MenubarTextValueOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Menubar Item. */
export type MenubarItemAsChildProps = ButtonLikeAsChildProps &
  MenubarTextValueOwnProps;

/** Props for Menubar Group. */
export type MenubarGroupProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menubar Group. */
export type MenubarGroupAsChildProps = BoxAsChildProps;

/** Props for Menubar Label. */
export type MenubarLabelProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menubar Label. */
export type MenubarLabelAsChildProps = BoxAsChildProps;

/** Props for Menubar Separator. */
export type MenubarSeparatorProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menubar Separator. */
export type MenubarSeparatorAsChildProps = BoxAsChildProps;

/** Props for Menubar Sub. */
export type MenubarSubProps = {
  children?: unknown;
  value?: string;
};

/** Props for Menubar Sub Trigger. */
export type MenubarSubTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
> &
  MenubarTextValueOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Menubar Sub Trigger. */
export type MenubarSubTriggerAsChildProps = ButtonLikeAsChildProps &
  MenubarTextValueOwnProps;

/** Props for Menubar Sub Content. */
export type MenubarSubContentProps = BoxProps<'div', HTMLDivElement> &
  MenubarContentOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Menubar Sub Content. */
export type MenubarSubContentAsChildProps = BoxAsChildProps &
  MenubarContentOwnProps;
