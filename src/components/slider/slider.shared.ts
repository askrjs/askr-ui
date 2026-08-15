import { defineScope, readScope } from '@askrjs/askr';
import type { SliderOrientation } from './slider.types';

/** Shape of the Slider Root Context Value. */
export type SliderRootContextValue = {
  sliderId: string;
  identity: object;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
  orientation: SliderOrientation;
  disabled: boolean;
  trackId: string;
  thumbId: string;
};

export const SliderRootContext = defineScope<SliderRootContextValue | null>(
  null
);

/**
 * Reads the Slider Root Context; throws if called outside its provider.
 */
export function readSliderRootContext(): SliderRootContextValue {
  const context = readScope(SliderRootContext);

  if (!context) {
    throw new Error('Slider parts must be used within <Slider>');
  }

  return context;
}
