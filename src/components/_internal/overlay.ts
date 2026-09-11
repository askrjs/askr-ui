// Barrel re-export: overlay behavior lives in `./overlay/*`, split by
// concern (z-index stacking, CSP nonce capture, portal/node registration,
// and viewport positioning). This file preserves the original import path
// so existing consumers are unaffected.
export type {
  OverlayAlign,
  OverlayIdentity,
  OverlayPortal,
  OverlaySide,
} from './overlay/types';
export { createOverlayIdentity } from './overlay/types';

export type { OverlayZIndex } from './overlay/z-index';
export {
  OVERLAY_Z_INDEX,
  resolveOverlayStackZIndex,
  setOverlayStackActive,
} from './overlay/z-index';

export { captureOverlayNonce } from './overlay/nonce';

export type { OverlayNodePart } from './overlay/portal';
export {
  getOverlayNodes,
  getPersistentPortal,
  registerOverlayNode,
} from './overlay/portal';

export {
  clearOverlayPosition,
  primeOverlayPosition,
  primeOverlayStackNode,
  syncOverlayPosition,
} from './overlay/position';
