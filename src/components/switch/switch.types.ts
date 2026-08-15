import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Switch, before merging with native element attributes. */
export type SwitchOwnProps = {
  children?: unknown;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
};

/** Props for Switch Button. */
export type SwitchButtonProps = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'onClick' | 'type' | 'ref'
> &
  SwitchOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLButtonElement>;
    type?: 'button' | 'submit' | 'reset';
  };

/** Props for the `asChild` (polymorphic) rendering of Switch. */
export type SwitchAsChildProps = SwitchOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
  type?: never;
};

/** Props for Switch. */
export type SwitchProps = SwitchButtonProps | SwitchAsChildProps;
