import { watch } from '@askrjs/askr/resources';
import { overlayNodes } from './portal';
import { primeOverlayStackNode } from './position';
import { OVERLAY_Z_INDEX, setOverlayStackActive } from './z-index';
import type { OverlayIdentity } from './types';

/** Adopt open order and refresh positioning only after the root render commits. */
export function syncOverlayStackActive(
  identity: OverlayIdentity,
  active: boolean,
  signal: AbortSignal,
  backdropId?: string
) {
  watch(
    () => [active, backdropId] as const,
    () => {
      setOverlayStackActive(identity, active, signal);
      if (backdropId) {
        primeOverlayStackNode(
          identity,
          'backdrop',
          backdropId,
          OVERLAY_Z_INDEX.modalBackdrop
        )();
      }
      overlayNodes.get(identity)?.updatePosition?.();
    }
  );
}
