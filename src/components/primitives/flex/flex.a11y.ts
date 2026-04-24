export const FLEX_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: 'data-slot' as const,
    layout: 'data-ak-layout' as const,
    direction: 'data-direction' as const,
    gap: 'data-gap' as const,
    gapX: 'data-gap-x' as const,
    gapY: 'data-gap-y' as const,
    align: 'data-align' as const,
    justify: 'data-justify' as const,
    wrap: 'data-wrap' as const,
    collapseBelow: 'data-collapse-below' as const,
  },
  SLOT_VALUES: {
    root: 'flex' as const,
  },
} as const;

export type FlexA11yContract = typeof FLEX_A11Y_CONTRACT;
