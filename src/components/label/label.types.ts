import type { Props } from '@askrjs/askr';
import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Label, before merging with native element attributes. */
export type LabelOwnProps = {
  children?: unknown;
};

/** Props for Label Label. */
export type LabelLabelProps = Omit<Props, 'children'> &
  LabelOwnProps & {
    asChild?: false;
    htmlFor?: string;
    ref?: Ref<HTMLLabelElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Label. */
export type LabelAsChildProps = LabelOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};

/** Props for Label. */
export type LabelProps = LabelLabelProps | LabelAsChildProps;
