import {
  composeHandlers,
  mergeProps,
  type MergedProps,
} from '@askrjs/askr/foundations/utilities';

/** Keep caller attribute precedence while running cancelable caller handlers first. */
export function mergeComponentProps<
  TCaller extends object,
  TDefaults extends object,
>(caller: TCaller, defaults: TDefaults): MergedProps<TCaller, TDefaults> {
  const merged = mergeProps(caller, defaults);
  const callerValues = caller as Record<string, unknown>;
  const defaultValues = defaults as Record<string, unknown>;
  for (const key of Object.keys(caller)) {
    const first = callerValues[key];
    const second = defaultValues[key];
    if (
      key.startsWith('on') &&
      typeof first === 'function' &&
      typeof second === 'function'
    ) {
      (merged as Record<string, unknown>)[key] = composeHandlers(
        first as (...args: readonly unknown[]) => void,
        second as (...args: readonly unknown[]) => void
      );
    }
  }
  return merged;
}
