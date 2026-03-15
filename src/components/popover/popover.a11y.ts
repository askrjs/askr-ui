/**
 * WAI-ARIA dialog-style popover contract.
 */

export const POPOVER_A11Y_CONTRACT = {
  TRIGGER_ATTRIBUTES: {
    popup: 'aria-haspopup' as const,
    expanded: 'aria-expanded' as const,
    controls: 'aria-controls' as const,
  },
  CONTENT_ATTRIBUTES: {
    role: 'dialog' as const,
    labelledBy: 'aria-labelledby' as const,
    tabIndex: -1,
  },
  DEFAULT_LABELING: {
    source: 'trigger-id' as const,
    override: 'aria-label or aria-labelledby' as const,
  },
  FOCUS_RULES: {
    trapScope: true,
    restoreFocusOnClose: true,
    dismissableLayer: true,
  },
} as const;

export type PopoverA11yContract = typeof POPOVER_A11Y_CONTRACT;
