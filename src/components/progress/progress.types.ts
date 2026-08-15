import type { BoxAsChildProps, BoxProps } from '../_internal/types';

/** Own props for Progress, before merging with native element attributes. */
export type ProgressOwnProps = {
  children?: unknown;
  id?: string;
  value?: number | null;
  max?: number;
  getValueLabel?: (value: number | null, max: number) => string;
};

/** Props for Progress. */
export type ProgressProps = BoxProps<'div', HTMLDivElement> & ProgressOwnProps;

/** Props for Progress Indicator. */
export type ProgressIndicatorProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Progress Indicator. */
export type ProgressIndicatorAsChildProps = BoxAsChildProps;
