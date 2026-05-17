import type { Props } from '@askrjs/askr';
import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

export type LabelOwnProps = {
  children?: unknown;
};

export type LabelLabelProps = Omit<Props, 'children'> &
  LabelOwnProps & {
    asChild?: false;
    htmlFor?: string;
    ref?: Ref<HTMLLabelElement>;
  };

export type LabelAsChildProps = LabelOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type LabelProps = LabelLabelProps | LabelAsChildProps;
