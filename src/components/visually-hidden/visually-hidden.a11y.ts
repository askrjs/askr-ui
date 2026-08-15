/**
 * Visually hidden content accessibility contract.
 */

export const VISUALLY_HIDDEN_A11Y_CONTRACT = {
  STRATEGY: 'visually-hidden-but-screen-reader-visible' as const,
  HOST_ELEMENT: 'span' as const,
} as const;

/** Type of the Visually Hidden A11y Contract object. */
export type VisuallyHiddenA11yContract = typeof VISUALLY_HIDDEN_A11Y_CONTRACT;
