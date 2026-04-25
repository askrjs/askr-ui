import type { JSXElement, Ref } from '@askrjs/askr-ui/foundations';
import type { ResponsiveValue } from '../../_internal/layout';

export type LayoutResponsive<T> = ResponsiveValue<T>;

export type BoxLayoutOwnProps = {
  display?: ResponsiveValue<string>;
  m?: ResponsiveValue<string | number>;
  mx?: ResponsiveValue<string | number>;
  my?: ResponsiveValue<string | number>;
  mt?: ResponsiveValue<string | number>;
  mr?: ResponsiveValue<string | number>;
  mb?: ResponsiveValue<string | number>;
  ml?: ResponsiveValue<string | number>;
  p?: ResponsiveValue<string | number>;
  px?: ResponsiveValue<string | number>;
  py?: ResponsiveValue<string | number>;
  pt?: ResponsiveValue<string | number>;
  pr?: ResponsiveValue<string | number>;
  pb?: ResponsiveValue<string | number>;
  pl?: ResponsiveValue<string | number>;
  width?: ResponsiveValue<string>;
  minWidth?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
  height?: ResponsiveValue<string>;
  minHeight?: ResponsiveValue<string>;
  maxHeight?: ResponsiveValue<string>;
  position?: ResponsiveValue<string>;
  inset?: ResponsiveValue<string | number>;
  top?: ResponsiveValue<string | number>;
  right?: ResponsiveValue<string | number>;
  bottom?: ResponsiveValue<string | number>;
  left?: ResponsiveValue<string | number>;
  overflow?: ResponsiveValue<string>;
  overflowX?: ResponsiveValue<string>;
  overflowY?: ResponsiveValue<string>;
  flexBasis?: ResponsiveValue<string>;
  flexGrow?: ResponsiveValue<string | number>;
  flexShrink?: ResponsiveValue<string | number>;
  gridArea?: ResponsiveValue<string>;
  gridColumn?: ResponsiveValue<string>;
  gridColumnStart?: ResponsiveValue<string>;
  gridColumnEnd?: ResponsiveValue<string>;
  gridRow?: ResponsiveValue<string>;
  gridRowStart?: ResponsiveValue<string>;
  gridRowEnd?: ResponsiveValue<string>;
  children?: unknown;
};

export type BoxOwnProps = BoxLayoutOwnProps & {
  as?: 'div' | 'span';
};

export type BoxDivProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  BoxOwnProps & {
    as?: 'div';
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type BoxSpanProps = Omit<
  JSX.IntrinsicElements['span'],
  'children' | 'ref'
> &
  BoxOwnProps & {
    as: 'span';
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

export type BoxAsChildProps = Omit<BoxOwnProps, 'as'> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['div']['style'];
};

export type BoxProps = BoxDivProps | BoxSpanProps | BoxAsChildProps;
