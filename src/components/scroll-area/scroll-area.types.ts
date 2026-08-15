import type { BoxAsChildProps, BoxProps } from '../_internal/types';

/** Own props for Scroll Area, before merging with native element attributes. */
export type ScrollAreaOwnProps = {
  children?: unknown;
  id?: string;
};

/** Props for Scroll Area. */
export type ScrollAreaProps = ScrollAreaOwnProps;

/** Props for Scroll Area Viewport. */
export type ScrollAreaViewportProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Scroll Area Viewport. */
export type ScrollAreaViewportAsChildProps = BoxAsChildProps;

/** Props for Scroll Area Scrollbar. */
export type ScrollAreaScrollbarProps = BoxProps<'div', HTMLDivElement> & {
  orientation?: 'vertical' | 'horizontal';
};

/** Props for Scroll Area Thumb. */
export type ScrollAreaThumbProps = BoxProps<'div', HTMLDivElement>;

/** Props for Scroll Area Corner. */
export type ScrollAreaCornerProps = BoxProps<'div', HTMLDivElement>;

/** Props for the `asChild` (polymorphic) rendering of Scroll Area. */
export type ScrollAreaAsChildProps = ScrollAreaOwnProps & {
  asChild: true;
  children: JSX.Element;
};
