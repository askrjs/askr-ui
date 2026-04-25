/**
 * dismissable
 *
 * THE dismissal primitive. Handles Escape key and outside interactions.
 */

export interface DismissableOptions {
  node?: Node | null;
  disabled?: boolean;
  onDismiss?: (trigger: 'escape' | 'outside') => void;
}

import type {
  KeyboardLikeEvent,
  PointerLikeEvent,
} from '../utilities/event-types';

export function dismissable({ node, disabled, onDismiss }: DismissableOptions) {
  function handleKeyDown(e: KeyboardLikeEvent) {
    if (disabled) return;
    if (e.key === 'Escape') {
      e.preventDefault?.();
      e.stopPropagation?.();
      onDismiss?.('escape');
    }
  }

  function handlePointerDownCapture(e: PointerLikeEvent) {
    if (disabled) return;

    const target = e.target;
    if (!(target instanceof Node)) return;

    if (!node) return;

    if (!node.contains(target)) {
      onDismiss?.('outside');
    }
  }

  return {
    onKeyDown: handleKeyDown,
    onPointerDownCapture: handlePointerDownCapture,
  };
}
