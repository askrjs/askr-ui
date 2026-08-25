import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';

/** Own props for Focus Scope, before merging with native element attributes. */
export type FocusScopeOwnProps = {
  children?: unknown;
  trapped?: boolean;
  loop?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  id?: string;
  tabIndex?: number;
};

/** Props for Focus Scope. */
export type FocusScopeProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  FocusScopeOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

/** Props for the `asChild` (polymorphic) rendering of Focus Scope. */
export type FocusScopeAsChildProps = FocusScopeOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<Element>;
};
