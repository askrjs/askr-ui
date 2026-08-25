import { describe, expect, it } from 'vite-plus/test';
import {
  createOverlayIdentity,
  getOverlayNodes,
  OVERLAY_Z_INDEX,
  registerOverlayNode,
  resolveOverlayStackZIndex,
  setOverlayStackActive,
} from '../../src/components/_internal/overlay';

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

  it('should ignore stale ref teardown after a replacement node registers', () => {
    const identity = createOverlayIdentity();
    const previousOwner = {};
    const replacementOwner = {};
    const previousNode = { id: 'previous' } as HTMLElement;
    const replacementNode = { id: 'replacement' } as HTMLElement;

    registerOverlayNode(identity, 'content', previousNode, previousOwner);
    registerOverlayNode(identity, 'content', replacementNode, replacementOwner);
    registerOverlayNode(identity, 'content', null, previousOwner);

    expect(getOverlayNodes(identity).content).toBe(replacementNode);

    registerOverlayNode(identity, 'content', null, replacementOwner);
    expect(getOverlayNodes(identity).content).toBeNull();
  });
});
