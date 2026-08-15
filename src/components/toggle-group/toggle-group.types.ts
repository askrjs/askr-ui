import type {
  ButtonLikeAsChildProps,
  ButtonLikeProps,
  BoxProps,
} from '../_internal/types';

/** Toggle Group Orientation. */
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

type ToggleGroupSharedOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  orientation?: ToggleGroupOrientation;
  loop?: boolean;
  disabled?: boolean;
};

/** Props for Toggle Group Single. */
export type ToggleGroupSingleProps = BoxProps<'div', HTMLDivElement> &
  ToggleGroupSharedOwnProps & {
    type?: 'single';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  };

/** Props for Toggle Group Multiple. */
export type ToggleGroupMultipleProps = BoxProps<'div', HTMLDivElement> &
  ToggleGroupSharedOwnProps & {
    type: 'multiple';
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  };

/** Props for Toggle Group. */
export type ToggleGroupProps =
  | ToggleGroupSingleProps
  | ToggleGroupMultipleProps;

/** Own props for Toggle Group Item, before merging with native element attributes. */
export type ToggleGroupItemOwnProps = {
  value: string;
  disabled?: boolean;
  children?: unknown;
};

/** Props for Toggle Group Item. */
export type ToggleGroupItemProps = ButtonLikeProps<
  'button',
  HTMLButtonElement
> &
  ToggleGroupItemOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Toggle Group Item. */
export type ToggleGroupItemAsChildProps = ButtonLikeAsChildProps &
  ToggleGroupItemOwnProps;
