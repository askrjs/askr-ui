/**
 * Layout helpers shared by headless layout primitives.
 */

export type LayoutBreakpoint = 'initial' | 'sm' | 'md' | 'lg' | 'xl';
export type ResponsiveValue<T> = T | Partial<Record<LayoutBreakpoint, T>>;

const BREAKPOINTS: readonly LayoutBreakpoint[] = [
  'initial',
  'sm',
  'md',
  'lg',
  'xl',
];

/** Units and patterns that identify a concrete CSS length value. */
const CSS_UNIT_RE =
  /^-?[\d.]+(%|px|em|rem|ex|ch|ic|lh|rlh|vw|vh|vmin|vmax|svw|svh|dvw|dvh|cqw|cqh|cqi|cqb|fr|cm|mm|in|pt|pc|Q)$/;

const SPACE_TOKEN_MAP: Record<string, string> = {
  '1': 'var(--ak-space-1)',
  '2': 'var(--ak-space-2)',
  '3': 'var(--ak-space-3)',
  '4': 'var(--ak-space-4)',
  '5': 'var(--ak-space-5)',
  '6': 'var(--ak-space-6)',
  '7': 'var(--ak-space-7)',
  '8': 'var(--ak-space-8)',
  '9': 'var(--ak-space-9)',
  xs: 'var(--ak-space-xs)',
  sm: 'var(--ak-space-sm)',
  md: 'var(--ak-space-md)',
  lg: 'var(--ak-space-lg)',
  xl: 'var(--ak-space-xl)',
  '2xl': 'var(--ak-space-2xl)',
  '3xl': 'var(--ak-space-3xl)',
};

const CONTAINER_SIZE_MAP: Record<string, string> = {
  '1': 'var(--ak-container-1)',
  '2': 'var(--ak-container-2)',
  '3': 'var(--ak-container-3)',
  '4': 'var(--ak-container-4)',
  sm: 'var(--ak-container-1)',
  md: 'var(--ak-container-2)',
  lg: 'var(--ak-container-3)',
  xl: 'var(--ak-container-4)',
};

const SECTION_SIZE_MAP: Record<string, string> = {
  '1': 'var(--ak-section-1)',
  '2': 'var(--ak-section-2)',
  '3': 'var(--ak-section-3)',
  '4': 'var(--ak-section-4)',
};

/**
 * Returns true when `value` is a concrete CSS length/size that can be applied
 * directly as an inline style.
 */
export function isCssLength(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v === '0') return true;
  if (CSS_UNIT_RE.test(v)) return true;
  // CSS functions: calc(), min(), max(), clamp(), fit-content(), env(), var()
  if (/^[a-z][a-z-]*\(/.test(v)) return true;
  return false;
}

export function isResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined
): value is Partial<Record<LayoutBreakpoint, T>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return BREAKPOINTS.some((breakpoint) => breakpoint in value);
}

export function normalizeResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined
): Partial<Record<LayoutBreakpoint, T>> | undefined {
  if (value === undefined) return undefined;
  if (isResponsiveValue(value)) return value;
  return { initial: value };
}

export function serializeResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined
): string | undefined {
  const normalized = normalizeResponsiveValue(value);
  if (!normalized) return undefined;

  return BREAKPOINTS.map((breakpoint) => {
    const breakpointValue = normalized[breakpoint];
    if (breakpointValue === undefined) return '';
    return `${breakpoint}:${String(breakpointValue)}`;
  })
    .filter(Boolean)
    .join('|');
}

export function setResponsiveStyleVar<T>(
  styles: Record<string, string | number>,
  variable: string,
  value: ResponsiveValue<T> | undefined,
  resolve: (value: T) => string | number | undefined = (input) =>
    input as string | number | undefined
) {
  const normalized = normalizeResponsiveValue(value);
  if (!normalized) return;

  for (const breakpoint of BREAKPOINTS) {
    const breakpointValue = normalized[breakpoint];
    if (breakpointValue === undefined) continue;
    const resolved = resolve(breakpointValue);
    if (resolved === undefined || resolved === null || resolved === '')
      continue;
    styles[`--ak-${variable}-${breakpoint}`] = resolved;
  }
}

export function resolveSpaceValue(value: string | number): string | number {
  if (typeof value === 'number') return String(value);
  const trimmed = value.trim();
  return SPACE_TOKEN_MAP[trimmed] ?? trimmed;
}

export function resolveContainerSizeValue(value: string): string {
  const trimmed = value.trim();
  return CONTAINER_SIZE_MAP[trimmed] ?? trimmed;
}

export function resolveSectionSizeValue(value: string): string {
  const trimmed = value.trim();
  return SECTION_SIZE_MAP[trimmed] ?? trimmed;
}

export function resolveGridTrackValue(value: string | number): string {
  if (typeof value === 'number') {
    return `repeat(${value}, minmax(0, 1fr))`;
  }

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return `repeat(${trimmed}, minmax(0, 1fr))`;
  }

  return trimmed;
}

export function resolveJustifyValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === 'between') return 'space-between';
  if (trimmed === 'start') return 'flex-start';
  if (trimmed === 'end') return 'flex-end';
  return trimmed;
}

export function resolveAlignValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === 'start') return 'flex-start';
  if (trimmed === 'end') return 'flex-end';
  return trimmed;
}

export function resolveInlineAlignValue(value: 'left' | 'center' | 'right'): {
  marginLeft?: string;
  marginRight?: string;
} {
  if (value === 'left') return { marginLeft: '0', marginRight: 'auto' };
  if (value === 'right') return { marginLeft: 'auto', marginRight: '0' };
  return { marginLeft: 'auto', marginRight: 'auto' };
}

/**
 * Merges a record of computed layout styles with a user-supplied `style` prop.
 * The user's styles take precedence for conflicting keys.
 */
export function mergeLayoutStyles(
  layout: Record<string, string | number>,
  user: unknown
): string {
  const merged: Record<string, unknown> = { ...layout };

  if (user !== null && user !== undefined && typeof user === 'object') {
    Object.assign(merged, user as Record<string, unknown>);
  }

  const mergedString = objectToCssString(merged);

  if (typeof user === 'string' && user.trim()) {
    return mergedString ? `${mergedString};${user.trim()}` : user.trim();
  }

  return mergedString;
}

function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
}

function objectToCssString(styles: Record<string, unknown>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${camelToKebab(key)}:${String(value)}`)
    .join(';');
}
