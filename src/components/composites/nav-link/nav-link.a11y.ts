/**
 * Accessibility contract for NavLink.
 */

export const NAV_LINK_A11Y_CONTRACT = {
  CURRENT_PAGE_ATTRIBUTE: 'aria-current' as const,
  CURRENT_PAGE_VALUE: 'page' as const,
  ACTIVE_STATE: 'active' as const,
  INACTIVE_STATE: 'inactive' as const,
  DATA_ATTRIBUTES: {
    slot: 'data-slot' as const,
    state: 'data-state' as const,
    marker: 'data-nav-link' as const,
  },
} as const;

export type NavLinkA11yContract = typeof NAV_LINK_A11Y_CONTRACT;
