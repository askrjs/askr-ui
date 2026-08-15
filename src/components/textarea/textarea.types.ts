import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Textarea, before merging with native element attributes. */
export type TextareaOwnProps = {
  children?: unknown;
  disabled?: boolean;
  tabIndex?: number;
};

/** Props for Textarea Element. */
export type TextareaElementProps = Omit<
  JSX.IntrinsicElements['textarea'],
  'children' | 'ref'
> &
  TextareaOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLTextAreaElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Textarea. */
export type TextareaAsChildProps = TextareaOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};

/** Props for Textarea. */
export type TextareaProps = TextareaElementProps | TextareaAsChildProps;
