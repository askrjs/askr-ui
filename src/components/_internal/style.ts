export function mergeCssVar(
  style: unknown,
  name: string,
  value: string
): string {
  const decl = `${name}:${value}`;

  if (typeof style === 'string') {
    const trimmed = style.trim();
    return trimmed ? `${trimmed};${decl}` : decl;
  }

  if (style && typeof style === 'object') {
    const entries = Object.entries(style as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(
        ([k, v]) =>
          `${k.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`)}:${String(v)}`
      )
      .join(';');
    return entries ? `${entries};${decl}` : decl;
  }

  return decl;
}

function serializeStyleValue(style: unknown): string {
  if (!style) {
    return '';
  }

  if (typeof style === 'string') {
    return style.trim();
  }

  if (typeof style !== 'object') {
    return '';
  }

  return Object.entries(style as Record<string, unknown>)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${key.replace(/([A-Z])/g, (character) => `-${character.toLowerCase()}`)}:${String(value)}`
    )
    .join(';');
}

export function mergeStyles(base: unknown, style: unknown): string | undefined {
  const parts = [serializeStyleValue(base), serializeStyleValue(style)].filter(
    Boolean
  );

  return parts.length > 0 ? parts.join(';') : undefined;
}
