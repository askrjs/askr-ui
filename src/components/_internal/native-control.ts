/** Marks native button fallbacks without imposing presentation on them. */
export function nativeButtonProps<T extends object>(props: T): T {
  return {
    ...props,
    'data-askr-native-control': 'true',
  } as T;
}
