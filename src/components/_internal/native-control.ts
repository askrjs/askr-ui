import { hasJsxIntrinsicType } from './jsx';

type NativeButtonType = 'button' | 'submit' | 'reset';

/** Marks native button fallbacks without imposing presentation on them. */
export function nativeButtonProps<T extends object>(props: T): T {
  return {
    ...props,
    'data-askr-native-control': 'true',
  } as T;
}

/**
 * Retains the native button default when an asChild host is a direct native
 * button. Opaque child components own their rendered host type.
 */
export function withDefaultNativeButtonType<Props extends object>(
  children: unknown,
  props: Props,
  type?: NativeButtonType
): Props & { type?: NativeButtonType } {
  if (
    !hasJsxIntrinsicType(children, 'button') ||
    children.props?.type != null
  ) {
    return props as Props & { type?: NativeButtonType };
  }

  return { ...props, type: type ?? 'button' };
}
