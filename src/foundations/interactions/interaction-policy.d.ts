/**
 * INTERACTION POLICY (FRAMEWORK LAW)
 *
 * This is THE ONLY way to create interactive elements. Components MUST NOT
 * implement interaction logic directly.
 */
import { Ref } from '../utilities/compose-ref';
export interface InteractionPolicyInput {
    isNative: boolean;
    disabled: boolean;
    onPress?: (e: Event) => void;
    ref?: Ref<unknown>;
}
export declare function applyInteractionPolicy({ isNative, disabled, onPress, ref, }: InteractionPolicyInput): {
    disabled: true | undefined;
    onClick: (e: Event) => void;
    ref: Ref<unknown>;
} | {
    'aria-disabled': true | undefined;
    tabIndex: number;
    ref: Ref<unknown>;
    onClick: (e: import("../utilities/event-types").DefaultPreventable & import("../utilities/event-types").PropagationStoppable) => void;
    disabled?: true;
    role?: "button";
    onKeyDown?: (e: import("../utilities/event-types").KeyboardLikeEvent) => void;
    onKeyUp?: (e: import("../utilities/event-types").KeyboardLikeEvent) => void;
};
export declare function mergeInteractionProps(childProps: Record<string, unknown>, policyProps: Record<string, unknown>, userProps?: Record<string, unknown>): Record<string, unknown>;
