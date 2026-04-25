/**
 * controllable
 *
 * Small utilities for controlled vs uncontrolled components. These helpers are
 * intentionally minimal and do not manage state themselves; they help component
 * implementations make correct decisions about when to call `onChange` vs
 * update internal state.
 */
import { type State } from '@askrjs/askr';
export declare function isControlled<T>(value: T | undefined): value is T;
export declare function resolveControllable<T>(value: T | undefined, defaultValue: T): {
    value: T;
    isControlled: boolean;
};
export declare function makeControllable<T>(options: {
    value: T | undefined;
    defaultValue: T;
    onChange?: (next: T) => void;
    setInternal?: (next: T) => void;
}): {
    set: (next: T) => void;
    isControlled: boolean;
};
export type ControllableState<T> = State<T> & {
    isControlled: boolean;
};
export declare function controllableState<T>(options: {
    value: T | undefined;
    defaultValue: T;
    onChange?: (next: T) => void;
}): ControllableState<T>;
