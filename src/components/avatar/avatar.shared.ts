import { defineContext, readContext } from '@askrjs/askr';
import type { AvatarLoadingStatus } from './avatar.types';

export type AvatarContextValue = {
  avatarId: string;
  status: AvatarLoadingStatus;
  setStatus: (status: AvatarLoadingStatus) => void;
};

export const AvatarContext = defineContext<AvatarContextValue | null>(null);

export function readAvatarContext(): AvatarContextValue {
  const context = readContext(AvatarContext);

  if (!context) {
    throw new Error('Avatar parts must be used within <Avatar>');
  }

  return context;
}
