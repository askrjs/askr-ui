import type { JSXElement } from '@askrjs/askr/foundations';

/**
 * Collapsible component prop types
 *
 * ## Design
 * - Root owns open state (controlled or uncontrolled)
 * - Trigger toggles state via button semantics
 * - Content mounts/unmounts based on open state
 */

/**
 * Root component props
 */
export interface CollapsibleProps {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Child components (Trigger, Content) */
  children?: unknown;
  /** Whether the collapsible is disabled */
  disabled?: boolean;
}

/**
 * Trigger component props (button semantics)
 */
export interface CollapsibleTriggerProps {
  /** Render as child element instead of button */
  asChild?: boolean;
  /** Child content */
  children?: unknown;
}

/**
 * Content component props
 */
export interface CollapsibleContentProps {
  /** Render as child element instead of div */
  asChild?: boolean;
  /** Child content */
  children?: unknown;
  /** Force mount even when closed (for animation) */
  forceMount?: boolean;
}
