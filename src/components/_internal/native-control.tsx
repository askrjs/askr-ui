type NativeButtonProps = JSX.IntrinsicElements['button'];
type NativeButtonStyleValue =
  | string
  | Record<string, string | number | null | undefined | false>
  | null
  | undefined
  | false;
type NativeButtonStyle = NativeButtonStyleValue | (() => NativeButtonStyleValue);

function inheritedFontValue(style: NativeButtonStyleValue): NativeButtonStyleValue {
  if (typeof style === 'string') {
    return `font: inherit;${style}`;
  }

  if (style && typeof style === 'object') {
    return { font: 'inherit', ...style };
  }

  return { font: 'inherit' };
}

function inheritNativeControlFont(style: NativeButtonStyle): NativeButtonStyle {
  if (typeof style === 'function') {
    return () => inheritedFontValue(style());
  }

  return inheritedFontValue(style);
}

/** Native button fallback with the accessibility-critical UA typography reset. */
export function NativeButton({
  style,
  ...props
}: NativeButtonProps): JSX.Element {
  return <button {...props} style={inheritNativeControlFont(style)} />;
}
