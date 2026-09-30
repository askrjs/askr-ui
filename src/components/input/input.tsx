import type { JSX } from '@askrjs/askr/jsx-runtime';
import { getSignal, state } from '@askrjs/askr';
import { nativeRef } from '../_internal/native-ref';
import { debounceEvent } from '@askrjs/askr/fx';
import { Slot } from '@askrjs/askr/foundations/structures';
import { focusable } from '@askrjs/askr/foundations/interactions';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
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
  const { asChild, children, disabled = false, ref, tabIndex, ...rest } = props;

  const focusProps = focusable({ disabled, tabIndex });
  const finalProps = mergeProps(rest, {
    ...focusProps,
    disabled: disabled ? true : undefined,
    'data-slot': 'input',
    'data-disabled': disabled ? 'true' : undefined,
    ref,
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

type DebouncedEmitter = ReturnType<typeof debounceEvent>;

/** Per-mount debounce state, kept across renders. */
type DebounceStore = {
  emitter: DebouncedEmitter | null;
  emitterMs: number;
  debounceMs: number;
  onDebouncedInput: ((value: string) => void) | undefined;
  pending: InputEvent | null;
};

/**
 * DebouncedInput is a convenience wrapper around Input that emits a settled
 * value for search and filter surfaces.
 *
 * The debounced emitter is created once per mount and replaced only when
 * `debounceMs` changes. A pending value is re-timed with the new delay (or
 * emitted at once when the delay drops to zero), is delivered to the latest
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
    emitter: null,
    emitterMs: 0,
    debounceMs,
    onDebouncedInput,
    pending: null,
  })();
  store.debounceMs = debounceMs;
  store.onDebouncedInput = onDebouncedInput;

  const cancelPending = () => {
    store.emitter?.cancel();
    store.pending = null;
  };

  const emit = (event: InputEvent) => {
    if (!store.onDebouncedInput) {
      cancelPending();
      return;
    }

    if (!store.emitter) {
      cancelPending();
      store.onDebouncedInput((event.target as HTMLInputElement).value);
      return;
    }

    store.pending = event;
    store.emitter(event);
  };

  // Create the emitter during render so it belongs to this component and is
  // cancelled on unmount, and replace it only when the delay changes.
  const emitterMs = onDebouncedInput && debounceMs > 0 ? debounceMs : 0;
  if (!onDebouncedInput) {
    cancelPending();
  }
  if ((store.emitter ? store.emitterMs : 0) !== emitterMs) {
    const pending = store.pending;
    cancelPending();
    store.emitterMs = emitterMs;
    store.emitter =
      emitterMs > 0
        ? debounceEvent(emitterMs, (settled) => {
            store.pending = null;
            store.onDebouncedInput?.(
              (settled.target as HTMLInputElement).value
            );
          })
        : null;

    if (pending) {
      // The emitter cannot be called during render, so re-time the pending
      // value with the new delay once this render has finished.
      const signal = getSignal();
      store.pending = pending;
      queueMicrotask(() => {
        if (!signal.aborted && store.pending === pending) emit(pending);
      });
    }
  }

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
