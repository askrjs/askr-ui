import type { JSX } from '@askrjs/askr/jsx-runtime';
import { state } from '@askrjs/askr';
import { task, watch } from '@askrjs/askr/resources';
import { nativeRef } from '../_internal/native-ref';
import { Slot } from '@askrjs/askr/foundations/structures';
import { focusable } from '@askrjs/askr/foundations/interactions';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { resolveAsChildRef } from '../_internal/slot-ref';
import type {
  DebouncedInputProps,
  InputAsChildProps,
  InputEvent,
  InputInputProps,
} from './input.types';

/**
 * Renders the `input` part of `input`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function Input(props: InputInputProps): JSX.Element;
export function Input(props: InputAsChildProps): JSX.Element;
export function Input(props: InputInputProps | InputAsChildProps) {
  const {
    asChild,
    children,
    disabled: disabledProp,
    ref,
    tabIndex,
    ...rest
  } = props;
  const disabled = disabledProp ?? false;

  const focusProps = focusable({ disabled, tabIndex });
  const normalizedRest = { ...rest } as Record<string, unknown>;
  if (disabled) {
    delete normalizedRest['aria-disabled'];
  }

  const resolvedRef = asChild
    ? resolveAsChildRef(children, ref as Ref<Element> | undefined)
    : ref;
  const finalProps = mergeProps(normalizedRest, {
    ...focusProps,
    ...(disabledProp === undefined ? {} : { disabled: disabledProp }),
    'data-slot': 'input',
    ...(disabledProp === undefined
      ? {}
      : { 'data-disabled': disabled ? 'true' : undefined }),
    ...(resolvedRef === undefined ? {} : { ref: resolvedRef }),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <input
      {...finalProps}
      disabled={disabled}
      ref={nativeRef<HTMLInputElement>(props)}
    />
  );
}

/** Per-mount debounce state, kept across renders. */
type DebounceStore = {
  timer: ReturnType<typeof setTimeout> | null;
  debounceMs: number;
  onDebouncedInput: ((value: string) => void) | undefined;
  pending: InputEvent | null;
};

/**
 * DebouncedInput is a convenience wrapper around Input that emits a settled
 * value for search and filter surfaces.
 *
 * One component-owned timer is re-timed when `debounceMs` changes (or emits
 * at once when the delay drops to zero). A pending value is delivered to the latest
 * `onDebouncedInput`, is dropped when `onDebouncedInput` is removed, and is
 * cancelled on unmount.
 */
export function DebouncedInput(props: DebouncedInputProps) {
  const {
    debounceMs = 180,
    onDebouncedInput,
    onInput,
    type = 'search',
    disabled = false,
    ...rest
  } = props;

  const isDisabled = disabled === true;
  const store = state<DebounceStore>({
    timer: null,
    debounceMs,
    onDebouncedInput,
    pending: null,
  })();

  const cancelPending = () => {
    if (store.timer !== null) clearTimeout(store.timer);
    store.timer = null;
    store.pending = null;
  };

  const emit = (event: InputEvent) => {
    if (!store.onDebouncedInput) {
      cancelPending();
      return;
    }

    if (!(store.debounceMs > 0)) {
      cancelPending();
      store.onDebouncedInput((event.target as HTMLInputElement).value);
      return;
    }

    if (store.timer !== null) clearTimeout(store.timer);
    store.pending = event;
    store.timer = setTimeout(() => {
      store.timer = null;
      store.pending = null;
      store.onDebouncedInput?.((event.target as HTMLInputElement).value);
    }, store.debounceMs);
  };

  watch(
    () => [debounceMs, onDebouncedInput] as const,
    ([committedMs, committedCallback]) => {
      const previousMs = store.debounceMs;
      store.debounceMs = committedMs;
      store.onDebouncedInput = committedCallback;
      if (!committedCallback) {
        cancelPending();
        return;
      }
      if (previousMs === committedMs) return;
      const pending = store.pending;
      cancelPending();
      if (pending) emit(pending);
    }
  );

  task(() => cancelPending);

  const handleInput = (event: Event) => {
    const inputEvent = event as InputEvent;
    onInput?.(inputEvent);

    if (isDisabled) {
      cancelPending();
      return;
    }

    emit(inputEvent);
  };

  return (
    <Input {...rest} disabled={isDisabled} type={type} onInput={handleInput} />
  );
}
