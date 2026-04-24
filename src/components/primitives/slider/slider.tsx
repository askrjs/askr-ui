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
import {
  SliderRootContext,
  readSliderRootContext,
  type SliderRootContextValue,
} from './slider.shared';

type SliderEntry = {
  track: HTMLElement | null;
  thumb: HTMLElement | null;
  dragMove: ((event: PointerEvent) => void) | null;
  dragEnd: ((event: PointerEvent) => void) | null;
};

const sliderEntries = new Map<string, SliderEntry>();
const sliderContexts = new Map<string, SliderRootContextValue>();

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

function getSliderRootContext(sliderId: string): SliderRootContextValue {
  const existing = sliderContexts.get(sliderId);

  if (existing) {
    return existing;
  }

  const created: SliderRootContextValue = {
    sliderId,
    value: 0,
    setValue: () => {},
    min: 0,
    max: 0,
    step: 1,
    orientation: 'horizontal',
    disabled: false,
    trackId: resolvePartId(sliderId, 'track'),
    thumbId: resolvePartId(sliderId, 'thumb'),
  };
  sliderContexts.set(sliderId, created);
  return created;
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

function SliderRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
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
  const rootContext = getSliderRootContext(sliderId);
  rootContext.sliderId = sliderId;
  rootContext.value = normalizedValue;
  rootContext.setValue = (nextValue: number) => {
    valueState.set(nextValue as never);
  };
  rootContext.min = min;
  rootContext.max = max;
  rootContext.step = step;
  rootContext.orientation = orientation;
  rootContext.disabled = disabled;
  rootContext.trackId = resolvePartId(sliderId, 'track');
  rootContext.thumbId = resolvePartId(sliderId, 'thumb');
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
  });

  return (
    <SliderRootContext.Scope value={rootContext}>
      <SliderRootView finalProps={finalProps}>
        {children}
        {name ? (
          <input
            type="hidden"
            name={name}
            value={String(normalizedValue)}
            disabled={disabled}
          />
        ) : null}
      </SliderRootView>
    </SliderRootContext.Scope>
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

      const nextValue =
        event.key === 'ArrowRight' || event.key === 'ArrowUp'
          ? root.value + root.step
          : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
            ? root.value - root.step
            : event.key === 'Home'
              ? root.min
              : event.key === 'End'
                ? root.max
                : event.key === 'PageUp'
                  ? root.value + root.step * 10
                  : event.key === 'PageDown'
                    ? root.value - root.step * 10
                    : null;

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
