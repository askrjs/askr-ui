import {
  extendVirtualCompositeIdentity,
  type VirtualCompositeScopeValue,
} from '../_internal/virtual-composite';

/**
 * The subset of virtual table instance state that composite/identity-context
 * wiring needs: the per-cell placement cache (so identical scope values are
 * reused across renders instead of allocated fresh, which would otherwise
 * defeat downstream memoization) and the current row keys, whose length is
 * the composite's set size.
 */
export type VirtualTableIdentityHost = {
  placements: Map<string, VirtualCompositeScopeValue>;
  keys: readonly string[];
};

/**
 * Resolves (and caches) the composite identity scope for one table cell,
 * so nested composite widgets (e.g. a listbox inside a cell) can locate
 * their position within the virtualized table.
 */
export function resolveVirtualTableScope(
  host: VirtualTableIdentityHost,
  parentIdentity: string | null,
  rowKey: string,
  columnId: string,
  index: number,
  placementEnabled: boolean
): VirtualCompositeScopeValue {
  const identity = extendVirtualCompositeIdentity(
    parentIdentity,
    'table-cell',
    rowKey,
    columnId
  );
  const placementKey = JSON.stringify([rowKey, columnId]);
  const existing = host.placements.get(placementKey);
  if (
    existing?.identity === identity &&
    existing.index === index &&
    existing.setSize === host.keys.length &&
    existing.placementEnabled === placementEnabled
  ) {
    return existing;
  }
  const scope = {
    identity,
    index,
    setSize: host.keys.length,
    placementEnabled,
  };
  host.placements.set(placementKey, scope);
  return scope;
}
