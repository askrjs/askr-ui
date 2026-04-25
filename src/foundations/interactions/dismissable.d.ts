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
import type { KeyboardLikeEvent, PointerLikeEvent } from '../utilities/event-types';
export declare function dismissable({ node, disabled, onDismiss }: DismissableOptions): {
    onKeyDown: (e: KeyboardLikeEvent) => void;
    onPointerDownCapture: (e: PointerLikeEvent) => void;
};
