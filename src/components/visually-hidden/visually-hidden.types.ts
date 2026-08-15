import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Visually Hidden, before merging with native element attributes. */
export type VisuallyHiddenOwnProps = {
  children?: unknown;
};

/** Props for Visually Hidden Span. */
export type VisuallyHiddenSpanProps = Omit<
  JSX.IntrinsicElements['span'],
  'children' | 'ref'
> &
  VisuallyHiddenOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Visually Hidden. */
export type VisuallyHiddenAsChildProps = VisuallyHiddenOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};

/** Props for Visually Hidden. */
export type VisuallyHiddenProps =
  | VisuallyHiddenSpanProps
  | VisuallyHiddenAsChildProps;
