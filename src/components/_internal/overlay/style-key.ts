import type { OverlayIdentity } from './types';

const overlayStyleKeys = new WeakMap<OverlayIdentity, string>();
let nextOverlayStyleKey = 0;

export function overlayStyleKey(identity: OverlayIdentity): string {
  const existing = overlayStyleKeys.get(identity);
  if (existing) return existing;
  const created = `overlay:${nextOverlayStyleKey++}`;
  overlayStyleKeys.set(identity, created);
  return created;
}
