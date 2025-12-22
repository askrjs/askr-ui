/**
 * controllable
 *
 * Small utilities for controlled vs uncontrolled components. These helpers are
 * intentionally minimal and do not manage state themselves; they help component
 * implementations make correct decisions about when to call `onChange` vs
 * update internal state.
 */

export function isControlled<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function resolveControllable<T>(value: T | undefined, defaultValue: T): { value: T; isControlled: boolean } {
  const controlled = isControlled(value);
  return { value: controlled ? (value as T) : defaultValue, isControlled: controlled };
}

export function makeControllable<T>(options: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T) => void;
  setInternal?: (next: T) => void;
}) {
  const { value, defaultValue, onChange, setInternal } = options;
  const { isControlled } = resolveControllable(value, defaultValue);

  function set(next: T) {
    if (isControlled) {
      onChange?.(next);
    } else {
      setInternal?.(next);
      onChange?.(next);
    }
  }

  return { set, isControlled };
}
