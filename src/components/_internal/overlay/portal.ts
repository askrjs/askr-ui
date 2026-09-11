import { definePortal } from '@askrjs/askr/foundations/structures';
import type { OverlayIdentity, OverlayPortal } from './types';

export type OverlayNodes = {
  trigger: HTMLElement | null;
  content: HTMLElement | null;
  title?: HTMLElement | null;
  description?: HTMLElement | null;
  cleanup?: () => void;
};

export type OverlayNodePart = 'trigger' | 'content' | 'title' | 'description';

export const overlayNodes = new WeakMap<OverlayIdentity, OverlayNodes>();
const overlayNodeOwners = new WeakMap<
  OverlayIdentity,
  Partial<Record<OverlayNodePart, object>>
>();
const overlayPortals = new WeakMap<OverlayIdentity, OverlayPortal>();

function createOverlayPortal(): OverlayPortal {
  return definePortal() as OverlayPortal;
}

export function getPersistentPortal(identity: OverlayIdentity) {
  const existing = overlayPortals.get(identity);

  if (existing) {
    return existing;
  }

  const created = createOverlayPortal();
  overlayPortals.set(identity, created);
  return created;
}

export function getOverlayNodes(identity: OverlayIdentity): OverlayNodes {
  const existing = overlayNodes.get(identity);

  if (existing) {
    return existing;
  }

  const created: OverlayNodes = {
    trigger: null,
    content: null,
  };

  overlayNodes.set(identity, created);
  return created;
}

export function registerOverlayNode(
  identity: OverlayIdentity,
  part: OverlayNodePart,
  node: HTMLElement | null,
  owner: object
) {
  const nodes = getOverlayNodes(identity);
  const owners = overlayNodeOwners.get(identity) ?? {};

  if (node) {
    owners[part] = owner;
    nodes[part] = node;
  } else if (owners[part] === owner) {
    delete owners[part];
    nodes[part] = null;
  }

  overlayNodeOwners.set(identity, owners);
}
