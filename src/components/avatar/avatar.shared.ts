import { defineScope, readScope } from '@askrjs/askr';
import type { AvatarLoadingStatus } from './avatar.types';

export type AvatarContextValue = {
  avatarId: string;
  identity: object;
  status: AvatarLoadingStatus;
  setStatus: (status: AvatarLoadingStatus) => void;
};

export const AvatarContext = defineScope<AvatarContextValue | null>(null);

export function readAvatarContext(): AvatarContextValue {
  const context = readScope(AvatarContext);

  if (!context) {
    throw new Error('Avatar parts must be used within <Avatar>');
  }

  return context;
}
