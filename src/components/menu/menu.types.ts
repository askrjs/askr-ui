import type { Orientation } from '@askrjs/askr/foundations/interactions';
import type {
  BoxAsChildProps,
  BoxProps,
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  PressEvent,
} from '../_internal/types';

/** Own props for Menu, before merging with native element attributes. */
export type MenuOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  orientation?: Orientation;
  loop?: boolean;
};

/** Props for Menu. */
export type MenuProps = MenuOwnProps;

/** Props for Menu Content. */
export type MenuContentProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menu Content. */
export type MenuContentAsChildProps = BoxAsChildProps;

/** Own props for Menu Item, before merging with native element attributes. */
export type MenuItemOwnProps = {
  children?: unknown;
  disabled?: boolean;
  onSelect?: (event: PressEvent) => void;
  /** Text used for typeahead when rendered children are not plain text. */
  textValue?: string;
};

/** Props for Menu Item. */
export type MenuItemProps = Omit<
  ButtonLikeProps<'button', HTMLButtonElement>,
  'onPress'
> &
  MenuItemOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Menu Item. */
export type MenuItemAsChildProps = Omit<ButtonLikeAsChildProps, 'onPress'> &
  MenuItemOwnProps;

/** Props for a presentational part within a Menu Item. */
export type MenuItemPartProps = BoxProps<'span', HTMLSpanElement>;
/** Props for a polymorphic presentational part within a Menu Item. */
export type MenuItemPartAsChildProps = BoxAsChildProps;

/** Props for Menu Group. */
export type MenuGroupProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menu Group. */
export type MenuGroupAsChildProps = BoxAsChildProps;

/** Props for Menu Label. */
export type MenuLabelProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menu Label. */
export type MenuLabelAsChildProps = BoxAsChildProps;

/** Props for Menu Separator. */
export type MenuSeparatorProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Menu Separator. */
export type MenuSeparatorAsChildProps = BoxAsChildProps;
