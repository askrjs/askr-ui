import { describe, expect, it } from 'vite-plus/test';
import { resolveVirtualTableScope } from '../../../../src/components/virtual-table/identity-wiring';
import type { VirtualCompositeScopeValue } from '../../../../src/components/_internal/virtual-composite';

function createHost(keys: string[]) {
  return {
    placements: new Map<string, VirtualCompositeScopeValue>(),
    keys,
  };
}

describe('virtual table identity wiring', () => {
  it('derives a scope identity from the parent identity, row key, and column', () => {
    const host = createHost(['row-1', 'row-2']);

    const scope = resolveVirtualTableScope(
      host,
      'parent-identity',
      'row-1',
      'name',
      0,
      true
    );

    expect(scope).toEqual({
      identity: JSON.stringify(['parent-identity', 'table-cell', 'row-1', 'name']),
      index: 0,
      setSize: 2,
      placementEnabled: true,
    });
  });

  it('returns the cached scope object when nothing relevant has changed', () => {
    const host = createHost(['row-1']);

    const first = resolveVirtualTableScope(host, null, 'row-1', 'name', 0, true);
    const second = resolveVirtualTableScope(host, null, 'row-1', 'name', 0, true);

    expect(second).toBe(first);
  });

  it('recomputes the scope when the index, set size, or placement flag changes', () => {
    const host = createHost(['row-1']);

    const first = resolveVirtualTableScope(host, null, 'row-1', 'name', 0, true);
    const second = resolveVirtualTableScope(host, null, 'row-1', 'name', 1, true);

    expect(second).not.toBe(first);
    expect(second.index).toBe(1);
  });
});
