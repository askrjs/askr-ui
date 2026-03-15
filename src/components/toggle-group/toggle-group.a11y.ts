/**
 * Accessibility contract for toggle groups.
 */

export const TOGGLE_GROUP_A11Y_CONTRACT = {
  GROUP_ROLE: 'group' as const,
  ITEM_ROLE: 'button' as const,
  PRESSED_ATTRIBUTE: 'aria-pressed' as const,
} as const;

export type ToggleGroupA11yContract = typeof TOGGLE_GROUP_A11Y_CONTRACT;
