/**
 * hoverable
 *
 * Produces props for pointer enter/leave handling. Pure and deterministic.
 */
export interface HoverableOptions {
    disabled?: boolean;
    onEnter?: (e: HoverEvent) => void;
    onLeave?: (e: HoverEvent) => void;
}
import type { DefaultPreventable, PropagationStoppable } from '../utilities/event-types';
type HoverEvent = DefaultPreventable & PropagationStoppable;
export interface HoverableResult {
    onPointerEnter?: (e: HoverEvent) => void;
    onPointerLeave?: (e: HoverEvent) => void;
}
export declare function hoverable({ disabled, onEnter, onLeave, }: HoverableOptions): HoverableResult;
export {};
