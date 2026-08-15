import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Orientation } from '@askrjs/askr/foundations/interactions';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Radio Group, before merging with native element attributes. */
export type RadioGroupOwnProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  orientation?: Orientation;
  loop?: boolean;
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
};

/** Props for Radio Group. */
export type RadioGroupProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  RadioGroupOwnProps & {
    ref?: Ref<HTMLDivElement>;
  };

/** Own props for Radio Group Item, before merging with native element attributes. */
export type RadioGroupItemOwnProps = {
  value: string;
  disabled?: boolean;
  children?: unknown;
};

/** Props for Radio Group Item. */
export type RadioGroupItemProps = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'ref' | 'onClick' | 'type' | 'value'
> &
  RadioGroupItemOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLButtonElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Radio Group Item. */
export type RadioGroupItemAsChildProps = RadioGroupItemOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};
