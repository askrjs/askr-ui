/**
 * Native input semantics wrapped by askr-ui Input.
 */

export const INPUT_A11Y_CONTRACT = {
  HOST_ELEMENT: 'input' as const,
  DISABLED_ATTRIBUTES: {
    native: 'disabled' as const,
    asChild: 'disabled' as const,
  },
  DATA_ATTRIBUTES: {
    disabled: 'data-disabled' as const,
  },
  FOCUS_RULES: {
    defaultTabIndex: 0,
    disabledTabIndex: -1,
  },
  LABELING: {
    supportsLabelElement: true,
    supportsAriaLabel: true,
    supportsAriaLabelledBy: true,
  },
} as const;

/** Type of the Input A11y Contract object. */
export type InputA11yContract = typeof INPUT_A11Y_CONTRACT;
