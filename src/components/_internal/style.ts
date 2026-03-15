export function mergeCssVar(
  style: unknown,
  name: string,
  value: string
): Record<string, unknown> | string {
  if (typeof style === 'string') {
    const trimmed = style.trim();
    return trimmed ? `${trimmed}; ${name}: ${value};` : `${name}: ${value};`;
  }

  if (style && typeof style === 'object') {
    return {
      ...(style as Record<string, unknown>),
      [name]: value,
    };
  }

  return {
    [name]: value,
  };
}