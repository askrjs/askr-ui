/**
 * pressable
 *
 * Interaction helper that produces VNode props for 'press' semantics.
 * - Pure and deterministic: no DOM construction or mutation here
 * - The runtime owns event attachment and scheduling
 * - This helper returns plain props (handlers) intended to be attached by the runtime
 *
 * Behaviour:
 * - For native buttons: only an `onClick` prop is provided (no ARIA or keyboard shims)
 * - For non-button elements: add `role="button"` and `tabIndex` and keyboard handlers
 * - Activation: `Enter` activates on keydown, `Space` activates on keyup (matches native button)
 * - Disabled: handlers short-circuit and `aria-disabled` is set for all hosts
 */
export interface PressableOptions {
    disabled?: boolean;
    onPress?: (e: PressEvent) => void;
    isNativeButton?: boolean;
}
import type { DefaultPreventable, KeyboardLikeEvent, PropagationStoppable } from '../utilities/event-types';
type PressEvent = DefaultPreventable & PropagationStoppable;
export interface PressableResult {
    onClick: (e: PressEvent) => void;
    disabled?: true;
    role?: 'button';
    tabIndex?: number;
    onKeyDown?: (e: KeyboardLikeEvent) => void;
    onKeyUp?: (e: KeyboardLikeEvent) => void;
    'aria-disabled'?: 'true';
}
export declare function pressable({ disabled, onPress, isNativeButton, }: PressableOptions): PressableResult;
export {};
