import { resolveVirtualRange } from '../../../../../src/components/_internal/virtualization';
import {
  buildVirtualTableState,
  syncVirtualTableRows,
  type VirtualTableOrchestrationHost,
} from '../../../../../src/components/virtual-table/virtualization-orchestration';

function createHost(
  overrides: Partial<VirtualTableOrchestrationHost<string>> = {}
): VirtualTableOrchestrationHost<string> {
  let scrollTop = 0;
  let viewportHeight = 0;

  return {
    keys: [],
    keyIndexMap: new Map(),
    rowHeight: 10,
    headerHeight: 0,
    rowsRef: null,
    placements: new Map(),
    viewportHeightHint: 0,
    visibleRange: resolveVirtualRange({
      totalCount: 0,
      rowHeight: 1,
      scrollTop: 0,
      viewportHeight: 0,
      overscan: 0,
    }),
    pendingScrollTop: null,
    scrollTopState: Object.assign(() => scrollTop, {
      set: (next: number) => {
        scrollTop = next;
      },
    }),
    viewportHeightState: Object.assign(() => viewportHeight, {
      set: (next: number) => {
        viewportHeight = next;
      },
    }),
    schedulePendingScrollTop: () => {},
    handleResize: () => {},
    ...overrides,
  };
}

export function stateSnapshot() {
  const host = createHost({
    keys: ['a', 'b', 'c'],
    keyIndexMap: new Map([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]),
    rowHeight: 20,
    headerHeight: 5,
  });
  const visibleRange = resolveVirtualRange({
    totalCount: 3,
    rowHeight: 20,
    scrollTop: 0,
    viewportHeight: 40,
    overscan: 0,
  });

  const snapshot = buildVirtualTableState(host, visibleRange, 0, 45, 'b');

  return { snapshot: () => snapshot, visibleRange: () => visibleRange };
}

export function unchangedRowsReference() {
  const rows = ['a', 'b'];
  const host = createHost({ keys: ['a', 'b'], rowsRef: rows });
  const keysBefore = host.keys;

  syncVirtualTableRows(host, rows, (row) => row);

  return { isSameKeys: () => host.keys === keysBefore };
}

export function changedRowsReference() {
  const host = createHost({
    keys: ['a'],
    keyIndexMap: new Map([['a', 0]]),
    rowsRef: ['a'],
    placements: new Map([['stale', {} as never]]),
  });

  syncVirtualTableRows(host, ['a', 'b', 'c'], (row) => row);

  return {
    result: () => ({
      keys: host.keys,
      indexOfC: host.keyIndexMap.get('c'),
      rowsRef: host.rowsRef,
      placementCount: host.placements.size,
    }),
  };
}

export function clampedPendingScrollTop() {
  const host = createHost({
    keys: ['a', 'b', 'c'],
    keyIndexMap: new Map([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]),
    rowsRef: ['a', 'b', 'c'],
    rowHeight: 10,
    headerHeight: 0,
    viewportHeightHint: 15,
  });
  host.scrollTopState.set(1000);

  syncVirtualTableRows(host, ['a'], (row) => row);

  return {
    result: () => ({
      isNull: host.pendingScrollTop === null,
      pendingScrollTop: host.pendingScrollTop,
    }),
  };
}
