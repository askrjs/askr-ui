import type { JSXElement, Ref } from '@askrjs/askr/foundations';

export type FlexOwnProps = {
  /** Flex direction. Defaults to 'row'. */
  direction?: 'row' | 'column';
  /** CSS gap value or named spacing token. Inline style only applied for real CSS lengths. */
  gap?: string;
  /** CSS align-items value. */
  align?: string;
  /** CSS justify-content value. */
  justify?: string;
  /** CSS flex-wrap value. */
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  /**
   * Named breakpoint below which a row layout collapses to a column.
   * Official themes recognize `sm`, `md`, `lg`, and `xl`.
   */
  collapseBelow?: string;
  children?: unknown;
};

export type FlexNativeProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  FlexOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type FlexAsChildProps = FlexOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['div']['style'];
};

export type FlexProps = FlexNativeProps | FlexAsChildProps;
