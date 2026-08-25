import { defineScope, readScope } from '@askrjs/askr';

export type CompositePlacement = {
  index: number;
  setSize?: number;
  virtualIdentity?: string;
};

export type VirtualCompositeScopeValue = CompositePlacement & {
  identity: string;
  placementEnabled: boolean;
};

export const VirtualCompositeIdentityContext =
  defineScope<VirtualCompositeScopeValue | null>(null);
export const VirtualCompositeOwnerContext = defineScope(false);

export function readVirtualCompositeOwner(): boolean {
  return readScope(VirtualCompositeOwnerContext);
}

export function readVirtualCompositeIdentity(): string | null {
  const value = readScope(VirtualCompositeIdentityContext);
  return value?.identity ?? null;
}

export function extendVirtualCompositeIdentity(
  parent: string | null,
  kind: 'list-row' | 'table-cell',
  key: string,
  columnId?: string
): string {
  return JSON.stringify([parent, kind, key, columnId ?? null]);
}

export function readVirtualCompositePlacement(
  ownerIdentity?: string | null
): VirtualCompositeScopeValue | null {
  const placement = readScope(VirtualCompositeIdentityContext);
  return placement &&
    placement.placementEnabled &&
    placement.identity !== ownerIdentity
    ? placement
    : null;
}

export function claimVirtualCompositePlacement(
  placement: CompositePlacement,
  claimIndex: () => number,
  ownerIdentity?: string | null
): CompositePlacement | null {
  const scopedPlacement = readVirtualCompositePlacement(ownerIdentity);
  if (scopedPlacement && 'identity' in scopedPlacement) {
    placement.virtualIdentity = scopedPlacement.identity;
  } else if (placement.virtualIdentity !== undefined) {
    placement.index = -1;
    placement.setSize = undefined;
    placement.virtualIdentity = undefined;
  }
  if (!scopedPlacement && placement.index < 0) {
    placement.index = claimIndex();
  }
  return scopedPlacement;
}

export function resolveVirtualCompositePlacement(
  node: HTMLElement
): CompositePlacement | null {
  const listRow = node.closest<HTMLElement>(
    '[data-slot="virtual-list-row"][data-index]'
  );
  if (listRow) {
    if (listRow.dataset.askrVirtualComposite !== 'true') return null;
    const index = Number(listRow.dataset.index);
    const setSize = Number(listRow.getAttribute('aria-setsize'));
    return Number.isInteger(index)
      ? { index, setSize: Number.isInteger(setSize) ? setSize : undefined }
      : null;
  }

  const tableRow = node.closest<HTMLElement>(
    '[data-slot="virtual-table-row"][data-row-index]'
  );
  if (!tableRow) return null;
  if (tableRow.dataset.askrVirtualComposite !== 'true') return null;
  const index = Number(tableRow.dataset.rowIndex);
  const rowCount = Number(
    tableRow
      .closest('[data-slot="virtual-table"]')
      ?.querySelector('[role="grid"]')
      ?.getAttribute('aria-rowcount')
  );
  return Number.isInteger(index)
    ? {
        index,
        setSize: Number.isInteger(rowCount)
          ? Math.max(0, rowCount - 1)
          : undefined,
      }
    : null;
}

export function compositeItemCount(
  items: readonly CompositePlacement[]
): number {
  return items.reduce(
    (count, item) => Math.max(count, item.setSize ?? item.index + 1),
    0
  );
}

export function firstEnabledCompositeItemIndex(
  items: readonly (CompositePlacement & { disabled: boolean })[]
): number {
  return items.find((item) => !item.disabled)?.index ?? 0;
}

export function disabledCompositeItemIndexes(
  items: readonly (CompositePlacement & { disabled: boolean })[]
): number[] {
  return items.filter((item) => item.disabled).map((item) => item.index);
}

export function scrollVirtualCompositeToIndex(index: number) {
  const active =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const row = active?.closest<HTMLElement>(
    '[data-slot="virtual-list-row"], [data-slot="virtual-table-row"]'
  );
  const viewport = row?.closest<HTMLElement>(
    '[data-slot="virtual-list"], [data-slot="virtual-table"]'
  );
  const rowHeight = Number(
    row?.getAttribute('data-askr-virtual-list-row-height') ??
      row?.getAttribute('data-askr-virtual-table-row-height')
  );

  if (viewport && Number.isFinite(rowHeight) && rowHeight > 0) {
    viewport.scrollTop = index * rowHeight;
    viewport.dispatchEvent(new Event('scroll'));
  }
}
