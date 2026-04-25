/**
 * focusable
 *
 * Normalize focus-related props for hosts.
 * - No DOM manipulation here; returns props that the runtime may attach.
 */
export interface FocusableOptions {
    disabled?: boolean;
    tabIndex?: number | undefined;
}
export interface FocusableResult {
    tabIndex?: number;
    'aria-disabled'?: 'true';
}
export declare function focusable({ disabled, tabIndex, }: FocusableOptions): FocusableResult;
