type DirectionEvent = {
  currentTarget?: EventTarget | null;
  target?: EventTarget | null;
};

/** Resolve the computed writing direction at an interaction target. */
export function resolveTextDirection(event: DirectionEvent): 'ltr' | 'rtl' {
  const candidate = event.currentTarget ?? event.target;
  if (!(candidate instanceof Element)) {
    return 'ltr';
  }

  return candidate.ownerDocument.defaultView?.getComputedStyle(candidate)
    .direction === 'rtl'
    ? 'rtl'
    : 'ltr';
}
