import type { JSXElement, Ref } from '@askrjs/askr-ui/foundations';
import type { BoxLayoutOwnProps, LayoutResponsive } from '../box/box.types';

export type SectionOwnProps = BoxLayoutOwnProps & {
  size?: LayoutResponsive<'1' | '2' | '3' | '4'>;
  children?: unknown;
};

export type SectionElementProps = Omit<
  JSX.IntrinsicElements['section'],
  'children' | 'ref'
> &
  SectionOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

export type SectionAsChildProps = SectionOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['section']['style'];
};

export type SectionProps = SectionElementProps | SectionAsChildProps;
