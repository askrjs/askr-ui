/**
 * rovingFocus
 *
 * Single tab stop navigation with arrow-key control.
 */

import type { KeyboardLikeEvent } from '../utilities/event-types';

export type Orientation = 'horizontal' | 'vertical' | 'both';

export interface RovingFocusOptions {
  currentIndex: number;
  itemCount: number;
  orientation?: Orientation;
  loop?: boolean;
  onNavigate?: (index: number) => void;
  isDisabled?: (index: number) => boolean;
}

export interface RovingFocusResult {
  container: {
    onKeyDown: (e: KeyboardLikeEvent) => void;
  };
  item: (index: number) => {
    tabIndex: number;
    'data-roving-index': number;
  };
}

export function rovingFocus(options: RovingFocusOptions): RovingFocusResult {
  const {
    currentIndex,
    itemCount,
    orientation = 'horizontal',
    loop = false,
    onNavigate,
    isDisabled,
  } = options;

  function findNextIndex(from: number, direction: 1 | -1): number | undefined {
    let next = from + direction;

    if (loop) {
      if (next < 0) next = itemCount - 1;
      if (next >= itemCount) next = 0;
    } else {
      if (next < 0 || next >= itemCount) return undefined;
    }

    if (isDisabled?.(next)) {
      if (next === from) return undefined;
      return findNextIndex(next, direction);
    }

    return next;
  }

  function handleKeyDown(e: KeyboardLikeEvent) {
    const { key } = e;

    let direction: 1 | -1 | undefined;

    if (orientation === 'horizontal' || orientation === 'both') {
      if (key === 'ArrowRight') direction = 1;
      if (key === 'ArrowLeft') direction = -1;
    }

    if (orientation === 'vertical' || orientation === 'both') {
      if (key === 'ArrowDown') direction = 1;
      if (key === 'ArrowUp') direction = -1;
    }

    if (direction === undefined) return;

    const nextIndex = findNextIndex(currentIndex, direction);
    if (nextIndex === undefined) return;

    e.preventDefault?.();
    e.stopPropagation?.();

    onNavigate?.(nextIndex);
  }

  return {
    container: {
      onKeyDown: handleKeyDown,
    },
    item: (index: number) => ({
      tabIndex: index === currentIndex ? 0 : -1,
      'data-roving-index': index,
    }),
  };
}
