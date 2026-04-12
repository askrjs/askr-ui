import { defineContext, readContext } from '@askrjs/askr';
import {
  Slot,
  composeRefs,
  controllableState,
  mergeProps,
} from '@askrjs/askr/foundations';
import { mergeCssVar } from '../../_internal/style';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import {
  rangePercentage,
  snapRangeValue,
  valueFromPointer,
} from '../../_internal/range';
import type {
  SliderProps,
  SliderRangeAsChildProps,
  SliderRangeProps,
  SliderThumbAsChildProps,
  SliderThumbProps,
  SliderTrackAsChildProps,
  SliderTrackProps,
} from './slider.types';

type SliderEntry = {
  track: HTMLElement | null;
  thumb: HTMLElement | null;
  dragMove: ((event: PointerEvent) => void) | null;
  dragEnd: ((event: PointerEvent) => void) | null;
};

type SliderRootContextValue = {
  sliderId: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
  trackId: string;
  thumbId: string;
};

const sliderEntries = new Map<string, SliderEntry>();
const SliderRootContext = defineContext<SliderRootContextValue | null>(null);

function getSliderEntry(sliderId: string) {
  const existing = sliderEntries.get(sliderId);

  if (existing) {
    return existing;
  }

  const created: SliderEntry = {
    track: null,
    thumb: null,
    dragMove: null,
    dragEnd: null,
  };
  sliderEntries.set(sliderId, created);
  return created;
}

function readSliderRootContext(): SliderRootContextValue {
  const context = readContext(SliderRootContext);

  if (!context) {
    throw new Error('Slider parts must be used within <Slider>');
  }

  return context;
}

function normalizeSliderConfig(props: SliderProps) {
  const min = typeof props.min === 'number' ? props.min : 0;
  const max = typeof props.max === 'number' ? props.max : 100;
  const step =
    typeof props.step === 'number' && props.step > 0 ? props.step : 1;

  return {
    min,
    max: max > min ? max : min + step,
    step,
  };
}

function updateSliderValueFromPointer(
  event: PointerEvent,
  root: SliderRootContextValue
) {
  const entry = getSliderEntry(root.sliderId);

  if (!entry.track) {
    return;
  }

  const nextValue = snapRangeValue(
    valueFromPointer(
      event,
      entry.track.getBoundingClientRect(),
      root.min,
      root.max,
      root.orientation
    ),
    root.min,
    root.max,
    root.step
  );

  root.setValue(nextValue);
  entry.thumb?.focus?.();
}

function beginSliderDrag(root: SliderRootContextValue) {
  const entry = getSliderEntry(root.sliderId);

  if (entry.dragMove || entry.dragEnd) {
    return;
  }

  entry.dragMove = (event: PointerEvent) => {
    updateSliderValueFromPointer(event, root);
  };
  entry.dragEnd = () => {
    if (entry.dragMove) {
      window.removeEventListener('pointermove', entry.dragMove);
    }

    if (entry.dragEnd) {
      window.removeEventListener('pointerup', entry.dragEnd);
    }

    entry.dragMove = null;
    entry.dragEnd = null;
  };
  window.addEventListener('pointermove', entry.dragMove);
  window.addEventListener('pointerup', entry.dragEnd);
}

function getSliderKeyDelta(
  key: string,
  currentValue: number,
  min: number,
  max: number,
  step: number
) {
  return key === 'ArrowRight' || key === 'ArrowUp'
    ? currentValue + step
    : key === 'ArrowLeft' || key === 'ArrowDown'
      ? currentValue - step
      : key === 'Home'
        ? min
        : key === 'End'
          ? max
          : key === 'PageUp'
            ? currentValue + step * 10
            : key === 'PageDown'
              ? currentValue - step * 10
              : null;
}

function readSliderValueFromEventTarget(
  target: EventTarget | null,
  fallback: number
) {
  if (!(target instanceof HTMLElement)) {
    return fallback;
  }

  const currentValueAttr = target.getAttribute('aria-valuenow');

  if (currentValueAttr === null) {
    return fallback;
  }

  const parsed = Number(currentValueAttr);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function Slider(props: SliderProps) {
  const {
    children,
    defaultValue,
    disabled = false,
    id,
    name,
    onValueChange,
    orientation = 'horizontal',
    ref,
    value,
    ...rest
  } = props;
  const { max, min, step } = normalizeSliderConfig(props);
  const sliderId = resolveCompoundId('slider', id, children);
  const valueState = controllableState({
    value,
    defaultValue: snapRangeValue(defaultValue ?? min, min, max, step),
    onChange: onValueChange,
  });
  const normalizedValue = snapRangeValue(valueState(), min, max, step);
  const percentage = rangePercentage(normalizedValue, min, max);
  const finalProps = mergeProps(rest, {
    ref,
    style: mergeCssVar(
      (rest as { style?: unknown }).style,
      '--ak-slider-percentage',
      `${percentage}%`
    ),
    'data-slot': 'slider',
    'data-slider': 'true',
    'data-orientation': orientation,
    'data-disabled': disabled ? 'true' : undefined,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.defaultPrevented || disabled) {
        return;
      }

      const target = event.target;

      if (
        !(target instanceof HTMLElement) ||
        target.getAttribute('data-slider-thumb') !== 'true'
      ) {
        return;
      }

      const currentValue = readSliderValueFromEventTarget(
        target,
        normalizedValue
      );
      const nextValue = getSliderKeyDelta(
        event.key,
        currentValue,
        min,
        max,
        step
      );

      if (nextValue === null) {
        return;
      }

      event.preventDefault();
      valueState.set(snapRangeValue(nextValue, min, max, step));
    },
  });
  const rootContext: SliderRootContextValue = {
    sliderId,
    value: normalizedValue,
    setValue: valueState.set,
    min,
    max,
    step,
    orientation,
    disabled,
    trackId: resolvePartId(sliderId, 'track'),
    thumbId: resolvePartId(sliderId, 'thumb'),
  };

  return (
    <div {...(finalProps as Record<string, unknown>)}>
      <SliderRootContext.Scope value={rootContext}>
        {children}
      </SliderRootContext.Scope>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={String(normalizedValue)}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}

export function SliderTrack(props: SliderTrackProps): JSX.Element;
export function SliderTrack(props: SliderTrackAsChildProps): JSX.Element;
export function SliderTrack(props: SliderTrackProps | SliderTrackAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readSliderRootContext();
  const entry = getSliderEntry(root.sliderId);
  const percentage = rangePercentage(root.value, root.min, root.max);
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        entry.track = node;
      }
    ),
    id: root.trackId,
    'data-slot': 'slider-track',
    'data-slider-track': 'true',
    'data-orientation': root.orientation,
    'data-percentage': String(percentage),
    onPointerDown: (event: PointerEvent) => {
      if (root.disabled) {
        return;
      }

      updateSliderValueFromPointer(event, root);
      beginSliderDrag(root);
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function SliderRange(props: SliderRangeProps): JSX.Element;
export function SliderRange(props: SliderRangeAsChildProps): JSX.Element;
export function SliderRange(props: SliderRangeProps | SliderRangeAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readSliderRootContext();
  const percentage = rangePercentage(root.value, root.min, root.max);
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'slider-range',
    'data-slider-range': 'true',
    'data-orientation': root.orientation,
    'data-percentage': String(percentage),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function SliderThumb(props: SliderThumbProps): JSX.Element;
export function SliderThumb(props: SliderThumbAsChildProps): JSX.Element;
export function SliderThumb(props: SliderThumbProps | SliderThumbAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readSliderRootContext();
  const entry = getSliderEntry(root.sliderId);
  const percentage = rangePercentage(root.value, root.min, root.max);
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        entry.thumb = node;
      }
    ),
    id: root.thumbId,
    role: 'slider',
    tabIndex: root.disabled ? undefined : 0,
    'aria-valuemin': String(root.min),
    'aria-valuemax': String(root.max),
    'aria-valuenow': String(root.value),
    'aria-orientation': root.orientation,
    'aria-disabled': root.disabled ? 'true' : undefined,
    'data-slot': 'slider-thumb',
    'data-slider-thumb': 'true',
    'data-orientation': root.orientation,
    'data-percentage': String(percentage),
    onPointerDown: (event: PointerEvent) => {
      if (root.disabled) {
        return;
      }

      event.preventDefault();
      beginSliderDrag(root);
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (root.disabled) {
        return;
      }

      const currentValue = readSliderValueFromEventTarget(
        event.currentTarget,
        root.value
      );
      const nextValue = getSliderKeyDelta(
        event.key,
        currentValue,
        root.min,
        root.max,
        root.step
      );

      if (nextValue === null) {
        return;
      }

      event.preventDefault();
      root.setValue(snapRangeValue(nextValue, root.min, root.max, root.step));
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
