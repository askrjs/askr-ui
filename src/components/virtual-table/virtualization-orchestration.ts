import {
  buildVirtualKeyIndexMap,
  createVirtualAnchor,
  resolveVirtualRetainedAnchorKey,
  resolveVirtualScrollTopForBottom,
  resolveVirtualScrollTopFromAnchor,
  resolveVirtualTotalHeight,
  type VirtualRange,
} from '../_internal/virtualization';
import type { VirtualTableState } from './virtual-table.types';

type StateCell<T> = (() => T) & {
  set: (next: T | ((prev: T) => T)) => void;
};

/**
 * The subset of virtual table instance state that the virtualization math
 * orchestration needs: row identity bookkeeping, the scroll/viewport state
 * cells, and the scheduling hooks used to apply a scroll-top correction (or
 * a resize re-measurement) after a row-set change without fighting the
 * browser's own scroll handling.
 */
export type VirtualTableOrchestrationHost<Row> = {
  keys: string[];
  keyIndexMap: Map<string, number>;
  rowHeight: number;
  headerHeight: number;
  rowsRef: readonly Row[] | null;
  placements: Map<string, unknown>;
  scrollTopState: StateCell<number>;
  viewportHeightState: StateCell<number>;
  viewportHeightHint: number;
  visibleRange: VirtualRange;
  pendingScrollTop: number | null;
  schedulePendingScrollTop: () => void;
  handleResize?: () => void;
};

/**
 * Builds the public `VirtualTableState` snapshot (row/viewport metrics,
 * visible range, selection) from the current host state.
 */
export function buildVirtualTableState<Row>(
  host: VirtualTableOrchestrationHost<Row>,
  visibleRange: VirtualRange,
  scrollTop: number,
  viewportHeight: number,
  selectedKey: string | null
): VirtualTableState {
  const totalHeight =
    resolveVirtualTotalHeight(host.keys.length, host.rowHeight) +
    host.headerHeight;

  return {
    count: host.keys.length,
    rowHeight: host.rowHeight,
    headerHeight: host.headerHeight,
    scrollTop,
    viewportHeight,
    totalHeight,
    visibleRange,
    isAtTop: visibleRange.isAtTop,
    isAtBottom: visibleRange.isAtBottom,
    selectedRowKey: selectedKey,
    selectedRowIndex:
      selectedKey === null ? -1 : (host.keyIndexMap.get(selectedKey) ?? -1),
  };
}

/**
 * Reconciles the host's row-identity bookkeeping (keys, key-index map,
 * per-cell placement cache) with a new `rows` array, and works out whether
 * the scroll position needs correcting so the row that was visible before
 * the change stays anchored in place.
 */
export function syncVirtualTableRows<Row>(
  host: VirtualTableOrchestrationHost<Row>,
  rows: readonly Row[],
  getKey: (row: Row, index: number) => string | number
) {
  const previousKeys = host.keys;
  const itemsChanged = host.rowsRef !== rows;

  if (!itemsChanged) {
    return;
  }

  const nextKeys = rows.map((row, index) => String(getKey(row, index)));
  host.placements.clear();
  const nextKeyIndexMap = buildVirtualKeyIndexMap(nextKeys);
  const previousVisibleKeys =
    host.visibleRange.visibleStartIndex < 0
      ? []
      : previousKeys.slice(
          host.visibleRange.visibleStartIndex,
          host.visibleRange.visibleEndIndex + 1
        );
  const currentScrollTop = host.scrollTopState();
  const currentViewportHeight =
    host.viewportHeightState() || host.viewportHeightHint;
  const currentBodyViewportHeight = Math.max(
    0,
    currentViewportHeight - host.headerHeight
  );
  const currentBodyScrollTop = Math.max(
    0,
    currentScrollTop - host.headerHeight
  );
  const currentBodyTotalHeight = resolveVirtualTotalHeight(
    previousKeys.length,
    host.rowHeight
  );
  const nextBodyTotalHeight = resolveVirtualTotalHeight(
    nextKeys.length,
    host.rowHeight
  );

  const anchorKey = resolveVirtualRetainedAnchorKey(
    previousVisibleKeys,
    nextKeyIndexMap
  );

  if (anchorKey) {
    const anchor = createVirtualAnchor(
      anchorKey,
      previousVisibleKeys,
      host.visibleRange.visibleStartIndex,
      currentBodyScrollTop,
      host.rowHeight
    );

    if (anchor) {
      const nextBodyScrollTop = resolveVirtualScrollTopFromAnchor(
        anchor,
        nextKeyIndexMap,
        host.rowHeight
      );

      if (nextBodyScrollTop !== null) {
        host.pendingScrollTop = host.headerHeight + nextBodyScrollTop;
      }
    }
  }

  const maxScrollTop =
    host.headerHeight +
    resolveVirtualScrollTopForBottom(
      nextBodyTotalHeight,
      currentBodyViewportHeight
    );
  host.pendingScrollTop = Math.min(
    Math.max(0, host.pendingScrollTop ?? currentScrollTop),
    maxScrollTop
  );

  host.keys = nextKeys;
  host.keyIndexMap = nextKeyIndexMap;
  host.rowsRef = rows;

  if (host.pendingScrollTop !== null) {
    host.schedulePendingScrollTop();
  }

  if (currentBodyTotalHeight === 0 && nextBodyTotalHeight > 0) {
    host.handleResize?.();
  }
}
