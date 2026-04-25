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
export declare function rovingFocus(options: RovingFocusOptions): RovingFocusResult;
