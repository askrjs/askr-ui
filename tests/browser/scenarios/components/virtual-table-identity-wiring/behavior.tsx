import type { VirtualCompositeScopeValue } from '../../../../../src/components/_internal/virtual-composite';
import { resolveVirtualTableScope } from '../../../../../src/components/virtual-table/identity-wiring';

function createHost(keys: string[]) {
  return {
    placements: new Map<string, VirtualCompositeScopeValue>(),
    keys,
  };
}

export function derivedScope() {
  const host = createHost(['row-1', 'row-2']);

  const scope = resolveVirtualTableScope(
    host,
    'parent-identity',
    'row-1',
    'name',
    0,
    true
  );

  return { scope: () => scope };
}

export function cachedScope() {
  const host = createHost(['row-1']);

  const first = resolveVirtualTableScope(host, null, 'row-1', 'name', 0, true);
  const second = resolveVirtualTableScope(host, null, 'row-1', 'name', 0, true);

  return { isSameScope: () => second === first };
}

export function recomputedScope() {
  const host = createHost(['row-1']);

  const first = resolveVirtualTableScope(host, null, 'row-1', 'name', 0, true);
  const second = resolveVirtualTableScope(host, null, 'row-1', 'name', 1, true);

  return {
    result: () => ({ isSameScope: second === first, index: second.index }),
  };
}
