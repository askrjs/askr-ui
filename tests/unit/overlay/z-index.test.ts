import { describe, expect, it } from 'vite-plus/test';
import {
  createOverlayIdentity,
  OVERLAY_Z_INDEX,
  resolveOverlayStackZIndex,
  setOverlayStackActive,
} from '../../../src/components/_internal/overlay/z-index';

function stackOffset(value: string): number {
  return Number(/\+ (\d+)\)$/.exec(value)?.[1]);
}

describe('overlay open-order stack', () => {
  it('should order every overlay family by activation and pair modal backdrops with content', () => {
    const first = createOverlayIdentity();
    const second = createOverlayIdentity();
    setOverlayStackActive(first, true);
    const firstContent = stackOffset(
      resolveOverlayStackZIndex(first, OVERLAY_Z_INDEX.dropdown)
    );
    setOverlayStackActive(second, true);
    const secondBackdrop = stackOffset(
      resolveOverlayStackZIndex(
        second,
        OVERLAY_Z_INDEX.modalBackdrop,
        'backdrop'
      )
    );
    const secondContent = stackOffset(
      resolveOverlayStackZIndex(second, OVERLAY_Z_INDEX.modal)
    );

    expect(secondBackdrop).toBeGreaterThan(firstContent);
    expect(secondContent).toBe(secondBackdrop + 1);

    setOverlayStackActive(first, false);
    setOverlayStackActive(first, true);
    expect(
      stackOffset(resolveOverlayStackZIndex(first, OVERLAY_Z_INDEX.dropdown))
    ).toBeGreaterThan(secondContent);

    setOverlayStackActive(first, false);
    setOverlayStackActive(second, false);
  });
});
