/**
 * Accessibility contract for Avatar primitives.
 */

export const AVATAR_A11Y_CONTRACT = {
  ROOT: {
    slot: 'data-slot' as const,
    marker: 'data-avatar' as const,
  },
  IMAGE: {
    slot: 'data-slot' as const,
    marker: 'data-avatar-image' as const,
    requiresAlt: true,
  },
  FALLBACK: {
    slot: 'data-slot' as const,
    marker: 'data-avatar-fallback' as const,
    visibleBeforeImageLoad: true,
  },
} as const;

/** Type of the Avatar A11y Contract object. */
export type AvatarA11yContract = typeof AVATAR_A11Y_CONTRACT;
