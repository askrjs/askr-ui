import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

export type VisuallyHiddenOwnProps = {
  children?: unknown;
};

export type VisuallyHiddenSpanProps = Omit<
  JSX.IntrinsicElements['span'],
  'children' | 'ref'
> &
  VisuallyHiddenOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

export type VisuallyHiddenAsChildProps = VisuallyHiddenOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type VisuallyHiddenProps =
  | VisuallyHiddenSpanProps
  | VisuallyHiddenAsChildProps;
