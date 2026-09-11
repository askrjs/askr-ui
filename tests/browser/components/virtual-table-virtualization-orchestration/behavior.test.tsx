import { describe, expect, it } from 'vite-plus/test';
import {
  buildVirtualTableState,
  syncVirtualTableRows,
  type VirtualTableOrchestrationHost,
} from '../../../../src/components/virtual-table/virtualization-orchestration';
import { resolveVirtualRange } from '../../../../src/components/_internal/virtualization';

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

describe('virtual table virtualization orchestration', () => {
  it('should build a state snapshot from the host and the visible range', () => {
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

    expect(snapshot).toEqual({
      count: 3,
      rowHeight: 20,
      headerHeight: 5,
      scrollTop: 0,
      viewportHeight: 45,
      totalHeight: 65,
      visibleRange,
      isAtTop: visibleRange.isAtTop,
      isAtBottom: visibleRange.isAtBottom,
      selectedRowKey: 'b',
      selectedRowIndex: 1,
    });
  });

  it('should do nothing when the rows reference has not changed', () => {
    const rows = ['a', 'b'];
    const host = createHost({ keys: ['a', 'b'], rowsRef: rows });
    const keysBefore = host.keys;

    syncVirtualTableRows(host, rows, (row) => row);

    expect(host.keys).toBe(keysBefore);
  });

  it('should rebuild keys and clear the placement cache when the rows reference changes', () => {
    const host = createHost({
      keys: ['a'],
      keyIndexMap: new Map([['a', 0]]),
      rowsRef: ['a'],
      placements: new Map([['stale', {} as never]]),
    });

    syncVirtualTableRows(host, ['a', 'b', 'c'], (row) => row);

    expect(host.keys).toEqual(['a', 'b', 'c']);
    expect(host.keyIndexMap.get('c')).toBe(2);
    expect(host.rowsRef).toEqual(['a', 'b', 'c']);
    expect(host.placements.size).toBe(0);
  });

  it('should clamp the pending scroll top to the new content bounds', () => {
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

    expect(host.pendingScrollTop).not.toBeNull();
    expect(host.pendingScrollTop as number).toBeLessThanOrEqual(10);
  });
});
