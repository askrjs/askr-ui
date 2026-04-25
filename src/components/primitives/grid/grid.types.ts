import type { JSXElement, Ref } from '@askrjs/askr-ui/foundations';
import type { BoxLayoutOwnProps, LayoutResponsive } from '../box/box.types';

export type GridOwnProps = BoxLayoutOwnProps & {
  areas?: LayoutResponsive<string>;
  columns?: LayoutResponsive<number | string>;
  rows?: LayoutResponsive<number | string>;
  flow?: LayoutResponsive<string>;
  gap?: LayoutResponsive<string | number>;
  gapX?: LayoutResponsive<string | number>;
  gapY?: LayoutResponsive<string | number>;
  align?: LayoutResponsive<string>;
  justify?: LayoutResponsive<string>;
  /** Compatibility helper for auto-fit grids. */
  minItemWidth?: string;
  /** Compatibility helper for auto-fit grids. */
  autoFit?: boolean;
  as?: 'div' | 'span';
  children?: unknown;
};

export type GridNativeProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  GridOwnProps & {
    as?: 'div';
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type GridSpanProps = Omit<
  JSX.IntrinsicElements['span'],
  'children' | 'ref'
> &
  GridOwnProps & {
    as: 'span';
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

export type GridAsChildProps = Omit<GridOwnProps, 'as'> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['div']['style'];
};

export type GridDivProps = GridNativeProps;

export type GridProps = GridDivProps | GridSpanProps | GridAsChildProps;
