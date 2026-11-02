import { defineScope, readScope } from '@askrjs/askr';
import { composeRefs, type Ref } from '@askrjs/askr/foundations/utilities';
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

/** Reads a host ref passed to an element used with an asChild Slider part. */
export function readSliderChildRef(
  children: unknown
): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

/** Combines refs owned by a Slider part with its asChild host ref. */
export function resolveSliderSlotRef(
  asChild: boolean | undefined,
  children: unknown,
  ref: Ref<Element> | undefined
): Ref<Element> | undefined {
  if (!asChild) return ref;
  const childRef = readSliderChildRef(children);
  if (ref == null && childRef == null) return undefined;
  return composeRefs(ref, childRef);
}

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
