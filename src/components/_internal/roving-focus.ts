import type {
  RovingFocusOptions,
  RovingFocusResult,
} from '@askrjs/askr/foundations/interactions';

type RovingFocusKeyEvent = Parameters<
  RovingFocusResult['container']['onKeyDown']
>[0];

/** Direction-aware roving focus for every UI composite consumer. */
export function rovingFocus(options: RovingFocusOptions): RovingFocusResult {
  const {
    currentIndex,
    itemCount,
    orientation = 'horizontal',
    loop = false,
    onNavigate,
    isDisabled,
  } = options;
  const effectiveCurrentIndex =
    currentIndex >= 0 && currentIndex < itemCount && !isDisabled?.(currentIndex)
      ? currentIndex
      : Array.from({ length: itemCount }, (_, index) => index).find(
          (index) => !isDisabled?.(index)
        );

  const findNextIndex = (
    from: number,
    direction: 1 | -1
  ): number | undefined => {
    let next = from;

    for (let steps = 0; steps < itemCount; steps += 1) {
      next += direction;

      if (loop) {
        if (next < 0) next = itemCount - 1;
        if (next >= itemCount) next = 0;
      } else if (next < 0 || next >= itemCount) {
        return undefined;
      }

      if (next === from) return undefined;
      if (!isDisabled?.(next)) return next;
    }

    return undefined;
  };

  const handleKeyDown = (event: RovingFocusKeyEvent) => {
    let direction: 1 | -1 | undefined;

    if (orientation === 'horizontal' || orientation === 'both') {
      const textDirection = resolveTextDirection(event);
      if (event.key === 'ArrowRight') {
        direction = textDirection === 'rtl' ? -1 : 1;
      }
      if (event.key === 'ArrowLeft') {
        direction = textDirection === 'rtl' ? 1 : -1;
      }
    }

    if (orientation === 'vertical' || orientation === 'both') {
      if (event.key === 'ArrowDown') direction = 1;
      if (event.key === 'ArrowUp') direction = -1;
    }

    if (direction === undefined) return;
    const nextIndex = findNextIndex(effectiveCurrentIndex ?? 0, direction);
    if (nextIndex === undefined) return;

    event.preventDefault?.();
    event.stopPropagation?.();
    onNavigate?.(nextIndex);
  };

  return {
    container: { onKeyDown: handleKeyDown },
    item: (index) => ({
      tabIndex: index === effectiveCurrentIndex ? 0 : -1,
      'data-roving-index': index,
    }),
  };
}

function resolveTextDirection(event: RovingFocusKeyEvent): 'ltr' | 'rtl' {
  const browserEvent = event as RovingFocusKeyEvent & {
    currentTarget?: EventTarget | null;
    target?: EventTarget | null;
  };
  const candidate = browserEvent.currentTarget ?? browserEvent.target;
  if (typeof Element === 'undefined' || !(candidate instanceof Element)) {
    return 'ltr';
  }

  return candidate.ownerDocument.defaultView?.getComputedStyle(candidate)
    .direction === 'rtl'
    ? 'rtl'
    : 'ltr';
}
