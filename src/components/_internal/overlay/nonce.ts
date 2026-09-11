import type { OverlayIdentity } from './types';

const overlayNonces = new WeakMap<OverlayIdentity, string | undefined>();

export function captureOverlayNonce(
  identity: OverlayIdentity,
  nonce: string | undefined
) {
  overlayNonces.set(identity, nonce);
}

export function getOverlayNonce(identity: OverlayIdentity): string | undefined {
  return overlayNonces.get(identity);
}
