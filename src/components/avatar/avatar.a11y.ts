/**
 * Accessibility contract for Avatar primitives.
 */

export const AVATAR_A11Y_CONTRACT = {
  ROOT: {
    marker: 'data-avatar' as const,
  },
  IMAGE: {
    marker: 'data-avatar-image' as const,
    requiresAlt: true,
  },
  FALLBACK: {
    marker: 'data-avatar-fallback' as const,
    visibleBeforeImageLoad: true,
  },
} as const;

export type AvatarA11yContract = typeof AVATAR_A11Y_CONTRACT;
