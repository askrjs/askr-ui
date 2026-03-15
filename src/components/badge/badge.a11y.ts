/**
 * Accessibility contract for Badge.
 */

export const BADGE_A11Y_CONTRACT = {
  MARKER: 'data-badge' as const,
  CONTENT: {
    textAllowed: true,
  },
} as const;

export type BadgeA11yContract = typeof BADGE_A11Y_CONTRACT;
