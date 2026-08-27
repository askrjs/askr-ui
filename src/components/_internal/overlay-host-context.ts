import { defineScope, readScope } from '@askrjs/askr';
import type { OverlayPortal } from './overlay';

export type OverlayHostRegistration = {
  key: string;
  portal: OverlayPortal;
  signal: AbortSignal;
};

export type OverlayHostContextValue = {
  getRegistrations: () => readonly OverlayHostRegistration[];
  register: (portal: OverlayPortal, signal: AbortSignal) => void;
};

export const OverlayHostContext = defineScope<OverlayHostContextValue | null>(null);

export function readOptionalOverlayHost(): OverlayHostContextValue | null {
  return readScope(OverlayHostContext);
}
