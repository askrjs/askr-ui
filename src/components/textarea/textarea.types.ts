import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

export type TextareaOwnProps = {
  children?: unknown;
  disabled?: boolean;
  tabIndex?: number;
};

export type TextareaElementProps = Omit<
  JSX.IntrinsicElements['textarea'],
  'children' | 'ref'
> &
  TextareaOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLTextAreaElement>;
  };

export type TextareaAsChildProps = TextareaOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type TextareaProps = TextareaElementProps | TextareaAsChildProps;
