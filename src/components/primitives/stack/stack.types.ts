import type { JSXElement, Ref } from '@askrjs/askr-ui/foundations';
import type { FlexOwnProps } from '../flex/flex.types';

export type StackOwnProps = Omit<FlexOwnProps, 'direction' | 'as'> & {
  children?: unknown;
};

export type StackDivProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  StackOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type StackAsChildProps = StackOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['div']['style'];
};

export type StackProps = StackDivProps | StackAsChildProps;
