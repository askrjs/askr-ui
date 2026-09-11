import { describe, expect, it } from 'vite-plus/test';
import { createOverlayIdentity } from '../../../../src/components/_internal/overlay/z-index';
import { registerOverlayNode } from '../../../../src/components/_internal/overlay/portal';
import {
  clearOverlayPosition,
  primeOverlayPosition,
  syncOverlayPosition,
} from '../../../../src/components/_internal/overlay/position';

describe('overlay positioning', () => {
  it('should prime a fixed-position style rule keyed to the overlay dom id', () => {
    const identity = createOverlayIdentity();
    const domId = 'overlay-prime-test';
    const content = document.createElement('div');
    content.setAttribute('data-askr-overlay-id', domId);
    document.body.appendChild(content);

    primeOverlayPosition(identity, domId, 1500);

    const styleRules = Array.from(document.head.querySelectorAll('style'))
      .map((el) => el.textContent ?? '')
      .join('\n');
    expect(styleRules).toContain('position: fixed');

    content.remove();
  });

  it('should attach and detach positioning effects around an overlay content node', () => {
    const identity = createOverlayIdentity();
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    document.body.appendChild(trigger);
    document.body.appendChild(content);

    const owner = {};
    registerOverlayNode(identity, 'trigger', trigger, owner);
    registerOverlayNode(identity, 'content', content, owner);

    expect(() => syncOverlayPosition(identity, 'sync-test')).not.toThrow();
    expect(content.dataset.side).toBeDefined();

    clearOverlayPosition(identity);

    trigger.remove();
    content.remove();
  });
});
