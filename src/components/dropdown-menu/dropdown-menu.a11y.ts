/**
 * Dropdown menu accessibility contract.
 */

export const DROPDOWN_MENU_A11Y_CONTRACT = {
  CONTENT_ROLE: 'menu' as const,
  ITEM_ROLE: 'menuitem' as const,
  TRIGGER_ATTRIBUTES: {
    expanded: 'aria-expanded' as const,
    controls: 'aria-controls' as const,
    hasPopup: 'aria-haspopup' as const,
  },
} as const;

export type DropdownMenuA11yContract = typeof DROPDOWN_MENU_A11Y_CONTRACT;
