import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Input Event. */
export type InputEvent = Event & {
  currentTarget: HTMLInputElement;
  target: HTMLInputElement;
};

/** Own props for Input, before merging with native element attributes. */
export type InputOwnProps = {
  children?: unknown;
  disabled?: boolean;
  tabIndex?: number;
};

/** Props for Input Input. */
export type InputInputProps = Omit<
  JSX.IntrinsicElements['input'],
  'children' | 'ref'
> &
  InputOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLInputElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Input. */
export type InputAsChildProps = InputOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};

/** Props for Debounced Input. */
export type DebouncedInputProps = Omit<InputInputProps, 'onInput' | 'type'> & {
  type?: JSX.IntrinsicElements['input']['type'];
  debounceMs?: number;
  onInput?: (event: InputEvent) => void;
  onDebouncedInput?: (value: string) => void;
};

/** Props for Input. */
export type InputProps = InputInputProps | InputAsChildProps;
