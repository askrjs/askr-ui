import type { JSXElement, Ref } from '@askrjs/askr/foundations';

/**
 * Press event passed to onPress handler
 *
 * Compatible with the pressable foundation's PressEvent type.
 */
export type PressEvent = {
  preventDefault?: () => void;
  stopPropagation?: () => void;
  defaultPrevented?: boolean;
};

/**
 * Toggle component prop types
 *
 * ## Type-level Invariants
 * - onClick is PROHIBITED — use onPress instead
 * - pressed is controlled state (no onChange, consumer manages state)
 * - asChild discriminates between native button and polymorphic rendering
 *
 * ## Why exclude onClick?
 * onClick doesn't enforce toggle semantics or disabled state.
 * onPress is handled by pressable foundation which ensures proper behavior.
 */

/**
 * Props shared by all Toggle variants
 */
export type ToggleOwnProps = {
  children?: unknown;
  
  /**
   * Handler for toggle press
   *
   * Called when toggle is activated. Consumer is responsible for
   * updating pressed state.
   */
  onPress?: () => void;

  /**
   * Pressed state
   *
   * Toggle is a controlled component. Consumer must manage pressed state.
   * Use aria-pressed for accessibility signaling.
   */
  pressed?: boolean;

  /**
   * Render children as a different component
   *
   * When true, merges props onto the single React element child.
   */
  asChild?: boolean;

  /**
   * Disabled state
   *
   * Prevents ALL interactions. Managed by pressable foundation.
   */
  disabled?: boolean;
};

/**
 * Props when rendering as a native <button> element
 */
export type ToggleButtonProps = ToggleOwnProps &
  Omit<JSX.IntrinsicElements['button'], 'onClick' | 'type' | 'ref'> & {
    asChild?: false;
    type?: 'button';
    ref?: Ref<HTMLButtonElement>;
  };

/**
 * Props when rendering via asChild
 */
export type ToggleAsChildProps = ToggleOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  type?: never;
};

/**
 * Discriminated union of Toggle prop types
 */
export type ToggleProps = ToggleButtonProps | ToggleAsChildProps;
