import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
  PressEvent,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

/** Own props for Dropdown, before merging with native element attributes. */
export type DropdownOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Props for `Dropdown`. */
export type DropdownProps = DropdownOwnProps;

/** Dropdown Trigger Variant. */
export type DropdownTriggerVariant = 'default' | 'ghost';
/** Dropdown Trigger Size. */
export type DropdownTriggerSize = 'md' | 'icon';

/** Own props for Dropdown Trigger, before merging with native element attributes. */
export type DropdownTriggerOwnProps = {
  variant?: DropdownTriggerVariant;
  size?: DropdownTriggerSize;
};

/** Props for Dropdown Trigger. */
export type DropdownTriggerProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
> &
  DropdownTriggerOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Dropdown Trigger. */
export type DropdownTriggerAsChildProps = ButtonLikeAsChildProps &
  DropdownTriggerOwnProps;

/** Props for Dropdown Portal. */
export type DropdownPortalProps = {
  children?: unknown;
};

/** Own props for Dropdown Content, before merging with native element attributes. */
export type DropdownContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

/** Props for Dropdown Content. */
export type DropdownContentProps = BoxProps<'div', HTMLDivElement> &
  DropdownContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Dropdown Content. */
export type DropdownContentAsChildProps = BoxAsChildProps &
  DropdownContentOwnProps;

/** Own props for Dropdown Item, before merging with native element attributes. */
export type DropdownItemOwnProps = {
  children?: unknown;
  disabled?: boolean;
  value?: string;
  variant?: DropdownItemVariant;
  onSelect?: (event: PressEvent) => void;
  /** Text used for typeahead when rendered children are not plain text. */
  textValue?: string;
};

/** Dropdown Item Variant. */
export type DropdownItemVariant = 'default' | 'destructive';

/** Props for Dropdown Item. */
export type DropdownItemProps = Omit<
  ButtonLikeProps<'button', HTMLButtonElement>,
  'onPress'
> &
  DropdownItemOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Dropdown Item. */
export type DropdownItemAsChildProps = Omit<ButtonLikeAsChildProps, 'onPress'> &
  DropdownItemOwnProps;

/** Props for Dropdown Group. */
export type DropdownGroupProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Dropdown Group. */
export type DropdownGroupAsChildProps = BoxAsChildProps;

/** Props for Dropdown Label. */
export type DropdownLabelProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Dropdown Label. */
export type DropdownLabelAsChildProps = BoxAsChildProps;

/** Props for Dropdown Separator. */
export type DropdownSeparatorProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Dropdown Separator. */
export type DropdownSeparatorAsChildProps = BoxAsChildProps;
