type NativeButtonStyleValue =
  | string
  | Record<string, string | number | null | undefined | false>
  | null
  | undefined
  | false;
type NativeButtonStyle =
  | NativeButtonStyleValue
  | (() => NativeButtonStyleValue);

function inheritedFontValue(
  style: NativeButtonStyleValue
): NativeButtonStyleValue {
  if (typeof style === 'string') {
    return `font: inherit;${style}`;
  }

  if (style && typeof style === 'object') {
    return { font: 'inherit', ...style };
  }

  return { font: 'inherit' };
}

function inheritNativeControlFont(style: unknown): NativeButtonStyle {
  if (typeof style === 'function') {
    return () => inheritedFontValue((style as () => NativeButtonStyleValue)());
  }

  return inheritedFontValue(style as NativeButtonStyleValue);
}

/** Adds the accessibility-critical UA typography reset beneath caller styles. */
export function nativeButtonProps<T extends object>(props: T): T {
  return {
    ...props,
    style: inheritNativeControlFont((props as { style?: unknown }).style),
  } as T;
}
