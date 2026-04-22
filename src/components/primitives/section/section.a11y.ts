export const SECTION_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: 'data-slot' as const,
    layout: 'data-ak-layout' as const,
    size: 'data-size' as const,
  },
  SLOT_VALUES: {
    root: 'section' as const,
  },
} as const;

export type SectionA11yContract = typeof SECTION_A11Y_CONTRACT;
