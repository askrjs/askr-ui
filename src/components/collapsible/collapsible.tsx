import { Slot, pressable, mergeProps } from '@askrjs/askr/foundations';
import type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from './collapsible.types';

/* ---------------------------------------------
 * Simple Collapsible (Single Component)
 * ------------------------------------------- */

let collapsibleIdCounter = 0;

/**
 * Simplified Collapsible component
 *
 * Single-component version that works without context.
 * For composition pattern, use external state management.
 *
 * @example Basic usage
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <button
 *   onClick={() => setOpen(!open)}
 *   aria-expanded={String(open)}
 *   aria-controls="content-1"
 * >
 *   Toggle
 * </button>
 * {open && <div id="content-1">Content</div>}
 * ```
 */

// NOTE: This implementation deferred - needs context API from askr runtime
// The template in RULES.md shows createContext/readContext but these
// aren't available in @askrjs/askr v0.0.9
//
// Collapsible requires:
// - Root component with state
// - Trigger subcomponent reading state via context
// - Content subcomponent reading state via context
//
// Without context API, this becomes manual state management
// which defeats the purpose of the component abstraction.

export function Collapsible(props: CollapsibleProps): JSX.Element {
  throw new Error(
    'Collapsible component requires context API which is not yet available in @askrjs/askr. ' +
      'Use manual state management with button + conditional rendering for now.'
  );
}

export function CollapsibleTrigger(
  props: CollapsibleTriggerProps
): JSX.Element {
  throw new Error(
    'Collapsible components require context API (not yet available)'
  );
}

export function CollapsibleContent(
  props: CollapsibleContentProps
): JSX.Element {
  throw new Error(
    'Collapsible components require context API (not yet available)'
  );
}
