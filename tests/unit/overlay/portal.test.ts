import { describe, expect, it } from 'vite-plus/test';
import { createOverlayIdentity } from '../../../src/components/_internal/overlay/z-index';
import {
  getOverlayNodes,
  registerOverlayNode,
} from '../../../src/components/_internal/overlay/portal';

describe('overlay node registration', () => {
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
