import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

export type FocusScopeOwnProps = {
  children?: unknown;
  trapped?: boolean;
  loop?: boolean;
  restoreFocus?: boolean;
  id?: string;
  tabIndex?: number;
};

export type FocusScopeProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  FocusScopeOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type FocusScopeAsChildProps = FocusScopeOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
