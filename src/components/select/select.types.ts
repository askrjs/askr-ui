import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxAsChildProps,
  BoxProps,
} from '../_internal/types';
import type { OverlayAlign, OverlaySide } from '../_internal/overlay';

/** Own props for Select, before merging with native element attributes. */
export type SelectOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
};

/** Props for Select. */
export type SelectProps = SelectOwnProps;

/** Select Trigger Size. */
export type SelectTriggerSize = 'sm' | 'md' | 'lg';

/** Own props for Select Trigger, before merging with native element attributes. */
export type SelectTriggerOwnProps = {
  size?: SelectTriggerSize;
};

/** Props for Select Trigger. */
export type SelectTriggerProps = ButtonLikeProps<'button', HTMLButtonElement> &
  SelectTriggerOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Select Trigger. */
export type SelectTriggerAsChildProps = ButtonLikeAsChildProps &
  SelectTriggerOwnProps;

/** Own props for Select Value, before merging with native element attributes. */
export type SelectValueOwnProps = {
  placeholder?: string;
  children?: unknown;
};

/** Props for Select Value. */
export type SelectValueProps = BoxProps<'span', HTMLSpanElement> &
  SelectValueOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Select Value. */
export type SelectValueAsChildProps = BoxAsChildProps & SelectValueOwnProps;

/** Props for Select Portal. */
export type SelectPortalProps = {
  children?: unknown;
};

/** Own props for Select Content, before merging with native element attributes. */
export type SelectContentOwnProps = {
  forceMount?: boolean;
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
};

/** Props for Select Content. */
export type SelectContentProps = BoxProps<'div', HTMLDivElement> &
  SelectContentOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Select Content. */
export type SelectContentAsChildProps = BoxAsChildProps & SelectContentOwnProps;

/** Own props for Select Item, before merging with native element attributes. */
export type SelectItemOwnProps = {
  children?: unknown;
  disabled?: boolean;
  textValue?: string;
  value: string;
};

/** Props for Select Item. */
export type SelectItemProps = Omit<
  ButtonLikeProps<'button', HTMLButtonElement>,
  'onPress'
> &
  SelectItemOwnProps;

/** Props for the `asChild` (polymorphic) rendering of Select Item. */
export type SelectItemAsChildProps = Omit<ButtonLikeAsChildProps, 'onPress'> &
  SelectItemOwnProps;

/** Props for Select Item Text. */
export type SelectItemTextProps = BoxProps<'span', HTMLSpanElement>;
/** Props for the `asChild` (polymorphic) rendering of Select Item Text. */
export type SelectItemTextAsChildProps = BoxAsChildProps;

/** Props for Select Group. */
export type SelectGroupProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Select Group. */
export type SelectGroupAsChildProps = BoxAsChildProps;

/** Props for Select Label. */
export type SelectLabelProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Select Label. */
export type SelectLabelAsChildProps = BoxAsChildProps;

/** Props for Select Separator. */
export type SelectSeparatorProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Select Separator. */
export type SelectSeparatorAsChildProps = BoxAsChildProps;
