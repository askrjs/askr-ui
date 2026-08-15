import type { BoxAsChildProps, BoxProps } from '../_internal/types';

/** Slider Orientation. */
export type SliderOrientation = 'horizontal' | 'vertical';

/** Own props for Slider, before merging with native element attributes. */
export type SliderOwnProps = {
  /** Supports literal, nested, array-mapped, and `For`-rendered descendants. */
  children?: unknown;
  id?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  disabled?: boolean;
  name?: string;
};

/** Props for Slider. */
export type SliderProps = BoxProps<'div', HTMLDivElement> & SliderOwnProps;

/** Props for Slider Track. */
export type SliderTrackProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Slider Track. */
export type SliderTrackAsChildProps = BoxAsChildProps;

/** Props for Slider Range. */
export type SliderRangeProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Slider Range. */
export type SliderRangeAsChildProps = BoxAsChildProps;

/** Props for Slider Thumb. */
export type SliderThumbProps = BoxProps<'div', HTMLDivElement>;
/** Props for the `asChild` (polymorphic) rendering of Slider Thumb. */
export type SliderThumbAsChildProps = BoxAsChildProps;
