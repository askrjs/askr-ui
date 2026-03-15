/**
 * WAI-ARIA tabs contract.
 */

export const TABS_A11Y_CONTRACT = {
  LIST_ROLE: 'tablist' as const,
  TAB_ROLE: 'tab' as const,
  PANEL_ROLE: 'tabpanel' as const,
  SELECTED_ATTRIBUTE: 'aria-selected' as const,
  CONTROLS_ATTRIBUTE: 'aria-controls' as const,
} as const;

export type TabsA11yContract = typeof TABS_A11Y_CONTRACT;