/**
 * Focus scope accessibility contract.
 */

export const FOCUS_SCOPE_A11Y_CONTRACT = {
  FEATURES: {
    trapped: true,
    loop: true,
    autoFocus: true,
    restoreFocus: true,
  },
} as const;

/** Type of the Focus Scope A11y Contract object. */
export type FocusScopeA11yContract = typeof FOCUS_SCOPE_A11Y_CONTRACT;
