/**
 * composeHandlers
 *
 * Compose two event handlers into one. The first handler runs, and unless it
 * calls `event.preventDefault()` (or sets `defaultPrevented`), the second
 * handler runs. This prevents accidental clobbering of child handlers when
 * injecting props.
 *
 * POLICY DECISIONS (LOCKED):
 *
 * 1. Execution Order
 *    First handler runs before second (injected before base).
 *    This allows injected handlers to prevent default behavior.
 *
 * 2. Default Prevention Check
 *    By default, checks `defaultPrevented` on first argument.
 *    Can be disabled via options.checkDefaultPrevented = false.
 *
 * 3. Undefined Handler Support
 *    Undefined handlers are skipped (no-op). This simplifies usage
 *    where handlers are optional.
 *
 * 4. Type Safety
 *    Args are readonly to prevent mutation. Return type matches input.
 */
export interface ComposeHandlersOptions {
    /**
     * When true (default), do not run the second handler if the first prevented default.
     * When false, always run both handlers.
     */
    checkDefaultPrevented?: boolean;
}
export declare function composeHandlers<A extends readonly unknown[]>(first?: (...args: A) => void, second?: (...args: A) => void, options?: ComposeHandlersOptions): (...args: A) => void;
