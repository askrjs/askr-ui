import type { JSXElement, Ref } from '@askrjs/askr-ui/foundations';
import type { BoxLayoutOwnProps, LayoutResponsive } from '../box/box.types';

export type FlexOwnProps = BoxLayoutOwnProps & {
  direction?: LayoutResponsive<
    'row' | 'column' | 'row-reverse' | 'column-reverse'
  >;
  gap?: LayoutResponsive<string | number>;
  gapX?: LayoutResponsive<string | number>;
  gapY?: LayoutResponsive<string | number>;
  align?: LayoutResponsive<string>;
  justify?: LayoutResponsive<string>;
  wrap?: LayoutResponsive<'wrap' | 'nowrap' | 'wrap-reverse'>;
  /**
   * Compatibility breakpoint helper. Prefer responsive `direction` instead.
   */
  collapseBelow?: string;
  as?: 'div' | 'span';
  children?: unknown;
};

export type FlexNativeProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  FlexOwnProps & {
    as?: 'div';
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type FlexSpanProps = Omit<
  JSX.IntrinsicElements['span'],
  'children' | 'ref'
> &
  FlexOwnProps & {
    as: 'span';
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

export type FlexAsChildProps = Omit<FlexOwnProps, 'as'> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['div']['style'];
};

export type FlexDivProps = FlexNativeProps;

export type FlexProps = FlexDivProps | FlexSpanProps | FlexAsChildProps;

export type InlineOwnProps = FlexOwnProps;
export type InlineNativeProps = FlexNativeProps;
export type InlineDivProps = FlexDivProps;
export type InlineSpanProps = FlexSpanProps;
export type InlineAsChildProps = FlexAsChildProps;
export type InlineProps = FlexProps;
