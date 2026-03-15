/**
 * WAI-ARIA menubar contract.
 */

export const MENUBAR_A11Y_CONTRACT = {
  ROOT_ROLE: 'menubar' as const,
  CONTENT_ROLE: 'menu' as const,
  ITEM_ROLE: 'menuitem' as const,
  EXPANDED_ATTRIBUTE: 'aria-expanded' as const,
  HAS_POPUP_ATTRIBUTE: 'aria-haspopup' as const,
} as const;

export type MenubarA11yContract = typeof MENUBAR_A11Y_CONTRACT;
