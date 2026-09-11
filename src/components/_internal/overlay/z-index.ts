import { removeDynamicStyleRule } from '../dynamic-style';
import { overlayStyleKey } from './style-key';
import type { OverlayIdentity } from './types';

export { createOverlayIdentity } from './types';

export const OVERLAY_Z_INDEX = {
  dropdown:
    'max(var(--ak-z-dropdown, 1000), calc(var(--ak-z-modal, 1400) + 1))',
  modalBackdrop: 'var(--ak-z-modal-backdrop, 1300)',
  modal: 'var(--ak-z-modal, 1400)',
  popover: 'var(--ak-z-popover, 1500)',
  toast: 'var(--ak-z-toast, 1550)',
  tooltip: 'var(--ak-z-tooltip, 1600)',
} as const;

export type OverlayZIndex =
  | number
  | (typeof OVERLAY_Z_INDEX)[keyof typeof OVERLAY_Z_INDEX];

type OverlayStackEntry = {
  active: boolean;
  order: number;
};

const overlayStackEntries = new WeakMap<OverlayIdentity, OverlayStackEntry>();
const overlayStackSignals = new WeakMap<OverlayIdentity, AbortSignal>();
let nextOverlayStackOrder = 0;
let activeOverlayStackEntries = 0;

function deactivateOverlayStackEntry(identity: OverlayIdentity) {
  const entry = overlayStackEntries.get(identity);
  if (!entry?.active) return;
  entry.active = false;
  activeOverlayStackEntries = Math.max(0, activeOverlayStackEntries - 1);
  if (activeOverlayStackEntries === 0) nextOverlayStackOrder = 0;
}

export function setOverlayStackActive(
  identity: OverlayIdentity,
  active: boolean,
  signal?: AbortSignal
) {
  const entry = overlayStackEntries.get(identity) ?? {
    active: false,
    order: 0,
  };

  if (active && !entry.active) {
    nextOverlayStackOrder += 1;
    entry.order = nextOverlayStackOrder;
    entry.active = true;
    activeOverlayStackEntries += 1;
  }
  overlayStackEntries.set(identity, entry);

  if (!active) {
    deactivateOverlayStackEntry(identity);
  }

  if (signal && overlayStackSignals.get(identity) !== signal) {
    overlayStackSignals.set(identity, signal);
    signal.addEventListener(
      'abort',
      () => {
        if (overlayStackSignals.get(identity) === signal) {
          deactivateOverlayStackEntry(identity);
          removeDynamicStyleRule(`${overlayStyleKey(identity)}:stack:backdrop`);
        }
      },
      { once: true }
    );
  }
}

export function resolveOverlayStackZIndex(
  identity: OverlayIdentity,
  requested: OverlayZIndex,
  layer: 'backdrop' | 'content' = 'content'
): string {
  const order = overlayStackEntries.get(identity)?.order ?? 0;
  const offset = order * 2 + (layer === 'content' ? 1 : 0);
  const fallback =
    typeof requested === 'number' ? Math.max(requested, 1600) : 1600;
  return `calc(var(--ak-z-overlay-stack-base, var(--ak-z-tooltip, ${fallback})) + ${offset})`;
}
