export const CONTAINER_A11Y_CONTRACT = {
  DATA_ATTRIBUTES: {
    slot: 'data-slot' as const,
    layout: 'data-ak-layout' as const,
    maxWidth: 'data-max-width' as const,
    padding: 'data-padding' as const,
    size: 'data-size' as const,
    align: 'data-align' as const,
  },
  SLOT_VALUES: {
    root: 'container' as const,
  },
} as const;

export type ContainerA11yContract = typeof CONTAINER_A11Y_CONTRACT;
