import { describe, expect, it } from 'vite-plus/test';
import { createOverlayIdentity } from '../../../src/components/_internal/overlay/z-index';
import {
  captureOverlayNonce,
  getOverlayNonce,
} from '../../../src/components/_internal/overlay/nonce';

describe('overlay CSP nonce capture', () => {
  it('should store and retrieve the nonce captured for an overlay identity', () => {
    const identity = createOverlayIdentity();
    expect(getOverlayNonce(identity)).toBeUndefined();

    captureOverlayNonce(identity, 'abc123');
    expect(getOverlayNonce(identity)).toBe('abc123');

    captureOverlayNonce(identity, undefined);
    expect(getOverlayNonce(identity)).toBeUndefined();
  });

  it('should keep nonces isolated per identity', () => {
    const first = createOverlayIdentity();
    const second = createOverlayIdentity();
    captureOverlayNonce(first, 'first-nonce');
    expect(getOverlayNonce(second)).toBeUndefined();
    expect(getOverlayNonce(first)).toBe('first-nonce');
  });
});
