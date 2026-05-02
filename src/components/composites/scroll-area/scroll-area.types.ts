import type { BoxAsChildProps, BoxProps } from '../../_internal/types';

export type ScrollAreaOwnProps = {
  children?: unknown;
  id?: string;
};

export type ScrollAreaProps = ScrollAreaOwnProps;

export type ScrollAreaViewportProps = BoxProps<'div', HTMLDivElement>;
export type ScrollAreaViewportAsChildProps = BoxAsChildProps;

export type ScrollAreaScrollbarProps = BoxProps<'div', HTMLDivElement> & {
  orientation?: 'vertical' | 'horizontal';
};

export type ScrollAreaThumbProps = BoxProps<'div', HTMLDivElement>;

export type ScrollAreaCornerProps = BoxProps<'div', HTMLDivElement>;

export type ScrollAreaAsChildProps = ScrollAreaOwnProps & {
  asChild: true;
  children: JSX.Element;
};
