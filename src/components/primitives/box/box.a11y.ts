export const BOX_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: 'data-slot' as const,
    layout: 'data-ak-layout' as const,
  },
  SLOT_VALUES: {
    root: 'box' as const,
  },
} as const;

export type BoxA11yContract = typeof BOX_A11Y_CONTRACT;
