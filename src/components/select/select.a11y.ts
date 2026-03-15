/**
 * Select accessibility contract.
 */

export const SELECT_A11Y_CONTRACT = {
  TRIGGER_ROLE: 'button' as const,
  CONTENT_ROLE: 'listbox' as const,
  ITEM_ROLE: 'option' as const,
  TRIGGER_ATTRIBUTES: {
    expanded: 'aria-expanded' as const,
    controls: 'aria-controls' as const,
    hasPopup: 'aria-haspopup' as const,
  },
  ITEM_SELECTION_ATTRIBUTE: 'aria-selected' as const,
} as const;

export type SelectA11yContract = typeof SELECT_A11Y_CONTRACT;