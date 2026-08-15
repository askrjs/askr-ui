import type { BoxAsChildProps, BoxProps } from '../_internal/types';

/** Props specific to `ProgressCircle`, before merging with native `div` attributes. */
export type ProgressCircleOwnProps = {
  children?: unknown;
  id?: string;
  value?: number | null;
  max?: number;
  getValueLabel?: (value: number | null, max: number) => string;
};

/** Props for `ProgressCircle`, combining native `div` attributes with `ProgressCircleOwnProps`. */
export type ProgressCircleProps = BoxProps<'div', HTMLDivElement> &
  ProgressCircleOwnProps;

/** Props for `ProgressCircleIndicator` rendered as a native `div`. */
export type ProgressCircleIndicatorProps = BoxProps<'div', HTMLDivElement>;
/** Props for `ProgressCircleIndicator` rendered polymorphically via `asChild`. */
export type ProgressCircleIndicatorAsChildProps = BoxAsChildProps;
