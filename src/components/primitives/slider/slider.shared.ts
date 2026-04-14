import { defineContext, readContext } from '@askrjs/askr';
import type { SliderOrientation } from './slider.types';

export type SliderRootContextValue = {
  sliderId: string;
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

export const SliderRootContext = defineContext<SliderRootContextValue | null>(
  null
);

export function readSliderRootContext(): SliderRootContextValue {
  const context = readContext(SliderRootContext);

  if (!context) {
    throw new Error('Slider parts must be used within <Slider>');
  }

  return context;
}
