import { state } from '@askrjs/askr';
import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import {
  assertPositiveVirtualHeight,
  buildVirtualKeyIndexMap,
  createVirtualAnchor,
  resolveVirtualRange,
  resolveVirtualRetainedAnchorKey,
  resolveVirtualScrollTopForBottom,
  resolveVirtualScrollTopForIndex,
  resolveVirtualScrollTopFromAnchor,
  resolveVirtualTotalHeight,
  resolveVirtualStyleHeight,
  setRefValue,
  type VirtualOverscan,
  type VirtualRange,
  type VirtualScrollAlignment,
} from '../_internal/virtualization';
import { isJsxElement } from '../_internal/jsx';
import type {
  VirtualTableApi,
  VirtualTableAsChildProps,
  VirtualTableColumn,
  VirtualTableProps,
  VirtualTableState,
} from './virtual-table.types';

type StateCell<T> = (() => T) & {
  set: (next: T | ((prev: T) => T)) => void;
};

type VirtualTableEntry<Row> = {
  wrapperNode: HTMLElement | null;
  tableNode: HTMLTableElement | null;
  userRef: Ref<HTMLElement> | undefined;
  apiRef: Ref<VirtualTableApi<Row> | null> | undefined;
  scrollTopState: StateCell<number>;
  viewportHeightState: StateCell<number>;
  viewportHeightHint: number;
  selectedKeyState: StateCell<string | null>;
  rowHeight: number;
  headerHeight: number;
  overscan: VirtualOverscan;
  columns: readonly VirtualTableColumn<Row>[];
  rowsRef: readonly Row[] | null;
  keys: string[];
  keyIndexMap: Map<string, number>;
  pendingScrollTop: number | null;
  pendingCommitFrame: number | null;
  resizeObserver: ResizeObserver | null;
  windowResizeHandler: (() => void) | null;
  rootRef: (node: HTMLElement | null) => void;
  tableRef: (node: HTMLTableElement | null) => void;
  handleScroll: () => void;
  handleResize: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  schedulePendingScrollTop: () => void;
  api: VirtualTableApi<Row>;
  visibleRange: VirtualRange;
  onRowClick:
    | ((row: Row, rowIndex: number, rowKey: string, event: MouseEvent) => void)
    | undefined;
  getKey: ((row: Row, index: number) => string | number) | null;
};

const virtualTableEntries = new Map<symbol, VirtualTableEntry<unknown>>();

function cloneJsxElement(
  element: JSXElement,
  props: Record<string, unknown>,
  children: unknown
) {
  return {
    ...element,
    props: mergeProps(element.props ?? {}, {
      ...props,
      children,
    }),
  } as JSXElement;
}

function getVirtualTableEntry<Row>(
  key: symbol,
  scrollTopState: StateCell<number>,
  viewportHeightState: StateCell<number>
): VirtualTableEntry<Row> {
  const existing = virtualTableEntries.get(key);

  if (existing) {
    return existing as VirtualTableEntry<Row>;
  }

  const entry = {} as VirtualTableEntry<Row>;

  const applyPendingScrollTop = () => {
    const nextScrollTop = entry.pendingScrollTop;
    const node = entry.wrapperNode;

    if (nextScrollTop === null || !node) {
      return;
    }

    entry.pendingScrollTop = null;

    if (node.scrollTop !== nextScrollTop) {
      node.scrollTop = nextScrollTop;
    }

    if (scrollTopState() !== nextScrollTop) {
      scrollTopState.set(nextScrollTop);
    }

    entry.handleScroll?.();
  };

  const schedulePendingScrollTop = () => {
    if (entry.pendingScrollTop === null || entry.pendingCommitFrame !== null) {
      return;
    }

    if (typeof requestAnimationFrame !== 'function') {
      applyPendingScrollTop();
      return;
    }

    // Defer the DOM write until after the render commit so the table keeps the
    // previously visible row anchored when rows are inserted or removed.
    entry.pendingCommitFrame = requestAnimationFrame(() => {
      entry.pendingCommitFrame = null;
      applyPendingScrollTop();
    });
  };

  const handleScroll = () => {
    const node = entry.wrapperNode;

    if (!node) {
      return;
    }

    // Read the live scroll position from the wrapper so the table window math
    // stays aligned with the browser's actual scroll state.
    const nextScrollTop = node.scrollTop;

    if (scrollTopState() !== nextScrollTop) {
      scrollTopState.set(nextScrollTop);
    }
  };

  const handleResize = () => {
    const node = entry.wrapperNode;

    if (!node) {
      return;
    }

    // The viewport height is a layout read, but virtualization needs the live
    // container size to keep the body window and scroll clamping correct.
    const nextViewportHeight =
      node.clientHeight || Number.parseFloat(node.style.height || '') || 0;

    if (viewportHeightState() !== nextViewportHeight) {
      viewportHeightState.set(nextViewportHeight);
    }

    const bodyViewportHeight = Math.max(
      0,
      nextViewportHeight - entry.headerHeight
    );
    const bodyTotalHeight = resolveVirtualTotalHeight(
      entry.keys.length,
      entry.rowHeight
    );
    const maxScrollTop =
      entry.headerHeight +
      resolveVirtualScrollTopForBottom(bodyTotalHeight, bodyViewportHeight);

    if (node.scrollTop > maxScrollTop) {
      node.scrollTop = maxScrollTop;

      if (scrollTopState() !== maxScrollTop) {
        scrollTopState.set(maxScrollTop);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const currentKey = entry.selectedKeyState();
    const currentIndex =
      currentKey === null ? -1 : (entry.keyIndexMap.get(currentKey) ?? -1);
    const visibleRange = entry.visibleRange;
    const fallbackIndex =
      visibleRange.visibleStartIndex >= 0 ? visibleRange.visibleStartIndex : 0;
    const lastVisibleIndex =
      visibleRange.visibleEndIndex >= 0
        ? visibleRange.visibleEndIndex
        : Math.max(0, entry.keys.length - 1);
    const pageStep = Math.max(1, visibleRange.visibleCount || 1);
    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex >= 0 ? currentIndex + 1 : fallbackIndex;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex >= 0 ? currentIndex - 1 : lastVisibleIndex;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = entry.keys.length - 1;
        break;
      case 'PageDown':
        nextIndex =
          currentIndex >= 0
            ? currentIndex + pageStep
            : Math.min(entry.keys.length - 1, fallbackIndex + pageStep);
        break;
      case 'PageUp':
        nextIndex =
          currentIndex >= 0
            ? currentIndex - pageStep
            : Math.max(0, lastVisibleIndex - pageStep);
        break;
      default:
        return;
    }

    if (entry.keys.length === 0) {
      return;
    }

    event.preventDefault();
    selectRowByIndex(nextIndex);
  };

  const rootRef = (node: HTMLElement | null) => {
    setRefValue(entry.userRef, node);

    if (entry.wrapperNode === node) {
      return;
    }

    if (entry.pendingCommitFrame !== null) {
      cancelAnimationFrame(entry.pendingCommitFrame);
      entry.pendingCommitFrame = null;
    }

    entry.resizeObserver?.disconnect();
    entry.resizeObserver = null;

    if (entry.windowResizeHandler) {
      window.removeEventListener('resize', entry.windowResizeHandler);
      entry.windowResizeHandler = null;
    }

    if (entry.wrapperNode) {
      entry.wrapperNode.removeEventListener('scroll', handleScroll);
    }

    entry.wrapperNode = node;

    if (!node) {
      setRefValue(entry.apiRef, null);
      return;
    }

    // Read the live container height once on mount so the initial render can
    // clamp the body window before the first scroll interaction.
    const nextViewportHeight =
      node.clientHeight || Number.parseFloat(node.style.height || '') || 0;
    viewportHeightState.set(nextViewportHeight);
    scrollTopState.set(node.scrollTop);

    node.addEventListener('scroll', handleScroll, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      entry.resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      entry.resizeObserver.observe(node);
    } else {
      entry.windowResizeHandler = handleResize;
      window.addEventListener('resize', handleResize);
    }

    handleScroll();
    handleResize();
    schedulePendingScrollTop();

    setRefValue(entry.apiRef, entry.api as VirtualTableApi<Row>);
  };

  const tableRef = (node: HTMLTableElement | null) => {
    entry.tableNode = node;
  };

  const scrollToIndex = (
    index: number,
    alignment: VirtualScrollAlignment = 'start'
  ) => {
    const node = entry.wrapperNode;
    const bodyViewportHeight = Math.max(
      0,
      (viewportHeightState() || entry.viewportHeightHint) - entry.headerHeight
    );
    const nextScrollTop =
      entry.headerHeight +
      resolveVirtualScrollTopForIndex(
        index,
        entry.rowHeight,
        bodyViewportHeight,
        entry.keys.length,
        alignment
      );

    entry.pendingScrollTop = nextScrollTop;
    entry.schedulePendingScrollTop();

    if (node && node.scrollTop !== nextScrollTop) {
      node.scrollTop = nextScrollTop;
    }

    if (scrollTopState() !== nextScrollTop) {
      scrollTopState.set(nextScrollTop);
    }
  };

  const selectRowByIndex = (index: number, reveal = true) => {
    const row = entry.rowsRef?.[index];

    if (!row) {
      return;
    }

    const getKey = entry.getKey;

    if (!getKey) {
      return;
    }

    const rowKey = String(getKey(row, index));
    entry.selectedKeyState.set(rowKey);

    if (reveal) {
      const visibleRange = entry.visibleRange;

      if (index < visibleRange.visibleStartIndex) {
        scrollToIndex(index, 'start');
      } else if (index > visibleRange.visibleEndIndex) {
        scrollToIndex(index, 'end');
      }
    }

    entry.tableNode?.focus?.();
  };

  const selectRowByKey = (rowKey: string) => {
    const index = entry.keyIndexMap.get(rowKey);

    if (index === undefined) {
      return;
    }

    selectRowByIndex(index);
  };

  const api: VirtualTableApi<Row> = {
    scrollToIndex(index, alignment = 'start') {
      scrollToIndex(index, alignment);
    },
    scrollToTop() {
      scrollToIndex(0, 'start');
    },
    scrollToBottom() {
      const node = entry.wrapperNode;
      const bodyViewportHeight = Math.max(
        0,
        (viewportHeightState() || entry.viewportHeightHint) - entry.headerHeight
      );
      const bodyTotalHeight = resolveVirtualTotalHeight(
        entry.keys.length,
        entry.rowHeight
      );
      const nextScrollTop =
        entry.headerHeight +
        resolveVirtualScrollTopForBottom(bodyTotalHeight, bodyViewportHeight);

      entry.pendingScrollTop = nextScrollTop;
      entry.schedulePendingScrollTop();

      if (node && node.scrollTop !== nextScrollTop) {
        node.scrollTop = nextScrollTop;
      }

      if (scrollTopState() !== nextScrollTop) {
        scrollTopState.set(nextScrollTop);
      }
    },
    getState() {
      const visibleRange = entry.visibleRange;
      const selectedKey = entry.selectedKeyState();

      return {
        count: entry.keys.length,
        rowHeight: entry.rowHeight,
        headerHeight: entry.headerHeight,
        scrollTop: scrollTopState(),
        viewportHeight: viewportHeightState(),
        totalHeight:
          resolveVirtualTotalHeight(entry.keys.length, entry.rowHeight) +
          entry.headerHeight,
        visibleRange,
        isAtTop: visibleRange.isAtTop,
        isAtBottom: visibleRange.isAtBottom,
        selectedRowKey: selectedKey,
        selectedRowIndex:
          selectedKey === null
            ? -1
            : (entry.keyIndexMap.get(selectedKey) ?? -1),
      };
    },
    getVisibleRange() {
      return entry.visibleRange;
    },
    getRowCount() {
      return entry.keys.length;
    },
    getScrollTop() {
      return scrollTopState();
    },
    isAtTop() {
      return entry.visibleRange.isAtTop;
    },
    isAtBottom() {
      return entry.visibleRange.isAtBottom;
    },
    getSelectedRowKey() {
      return entry.selectedKeyState();
    },
    getSelectedRowIndex() {
      const selectedKey = entry.selectedKeyState();

      return selectedKey === null
        ? -1
        : (entry.keyIndexMap.get(selectedKey) ?? -1);
    },
    selectRowByKey(rowKey: string) {
      selectRowByKey(rowKey);
    },
    selectRowByIndex(index: number) {
      selectRowByIndex(index);
    },
    clearSelection() {
      entry.selectedKeyState.set(null);
    },
  };

  entry.scrollTopState = scrollTopState;
  entry.viewportHeightState = viewportHeightState;
  entry.viewportHeightHint = entry.viewportHeightHint ?? 0;
  entry.api = api;
  entry.rootRef = rootRef;
  entry.tableRef = tableRef;
  entry.handleScroll = handleScroll;
  entry.handleResize = handleResize;
  entry.handleKeyDown = handleKeyDown;
  entry.schedulePendingScrollTop = schedulePendingScrollTop;
  entry.resizeObserver = null;
  entry.windowResizeHandler = null;
  entry.wrapperNode = entry.wrapperNode ?? null;
  entry.tableNode = entry.tableNode ?? null;
  entry.userRef = entry.userRef ?? undefined;
  entry.apiRef = entry.apiRef ?? undefined;
  entry.rowHeight = entry.rowHeight ?? 0;
  entry.headerHeight = entry.headerHeight ?? 0;
  entry.overscan = entry.overscan ?? 0;
  entry.columns = entry.columns ?? [];
  entry.rowsRef = entry.rowsRef ?? null;
  entry.keys = entry.keys ?? [];
  entry.keyIndexMap = entry.keyIndexMap ?? new Map<string, number>();
  entry.pendingScrollTop = entry.pendingScrollTop ?? null;
  entry.pendingCommitFrame = entry.pendingCommitFrame ?? null;
  entry.visibleRange =
    entry.visibleRange ??
    resolveVirtualRange({
      totalCount: 0,
      rowHeight: 1,
      scrollTop: 0,
      viewportHeight: 0,
      overscan: 0,
    });
  entry.onRowClick = entry.onRowClick ?? undefined;
  entry.getKey = entry.getKey ?? null;

  virtualTableEntries.set(key, entry as VirtualTableEntry<unknown>);
  return entry as VirtualTableEntry<Row>;
}

function buildVirtualTableState<Row>(
  entry: VirtualTableEntry<Row>,
  visibleRange: VirtualRange,
  scrollTop: number,
  viewportHeight: number,
  selectedKey: string | null
): VirtualTableState {
  const totalHeight =
    resolveVirtualTotalHeight(entry.keys.length, entry.rowHeight) +
    entry.headerHeight;

  return {
    count: entry.keys.length,
    rowHeight: entry.rowHeight,
    headerHeight: entry.headerHeight,
    scrollTop,
    viewportHeight,
    totalHeight,
    visibleRange,
    isAtTop: visibleRange.isAtTop,
    isAtBottom: visibleRange.isAtBottom,
    selectedRowKey: selectedKey,
    selectedRowIndex:
      selectedKey === null ? -1 : (entry.keyIndexMap.get(selectedKey) ?? -1),
  };
}

function syncVirtualTableRows<Row>(
  entry: VirtualTableEntry<Row>,
  rows: readonly Row[],
  getKey: (row: Row, index: number) => string | number
) {
  const previousKeys = entry.keys;
  const itemsChanged = entry.rowsRef !== rows;

  if (!itemsChanged) {
    return;
  }

  const nextKeys = rows.map((row, index) => String(getKey(row, index)));
  const nextKeyIndexMap = buildVirtualKeyIndexMap(nextKeys);
  const previousVisibleKeys =
    entry.visibleRange.visibleStartIndex < 0
      ? []
      : previousKeys.slice(
          entry.visibleRange.visibleStartIndex,
          entry.visibleRange.visibleEndIndex + 1
        );
  const currentScrollTop = entry.scrollTopState();
  const currentViewportHeight =
    entry.viewportHeightState() || entry.viewportHeightHint;
  const currentBodyViewportHeight = Math.max(
    0,
    currentViewportHeight - entry.headerHeight
  );
  const currentBodyScrollTop = Math.max(
    0,
    currentScrollTop - entry.headerHeight
  );
  const currentBodyTotalHeight = resolveVirtualTotalHeight(
    previousKeys.length,
    entry.rowHeight
  );
  const nextBodyTotalHeight = resolveVirtualTotalHeight(
    nextKeys.length,
    entry.rowHeight
  );

  const anchorKey = resolveVirtualRetainedAnchorKey(
    previousVisibleKeys,
    nextKeyIndexMap
  );

  if (anchorKey) {
    const anchor = createVirtualAnchor(
      previousVisibleKeys,
      entry.visibleRange.visibleStartIndex,
      currentBodyScrollTop,
      entry.rowHeight
    );

    if (anchor) {
      const nextBodyScrollTop = resolveVirtualScrollTopFromAnchor(
        anchor,
        nextKeyIndexMap,
        entry.rowHeight
      );

      if (nextBodyScrollTop !== null) {
        entry.pendingScrollTop = entry.headerHeight + nextBodyScrollTop;
      }
    }
  }

  if (entry.pendingScrollTop === null) {
    const maxScrollTop =
      entry.headerHeight +
      resolveVirtualScrollTopForBottom(
        nextBodyTotalHeight,
        currentBodyViewportHeight
      );

    entry.pendingScrollTop = Math.min(currentScrollTop, maxScrollTop);
  }

  entry.keys = nextKeys;
  entry.keyIndexMap = nextKeyIndexMap;
  entry.rowsRef = rows;

  if (entry.pendingScrollTop !== null) {
    entry.schedulePendingScrollTop();
  }

  if (currentBodyTotalHeight === 0 && nextBodyTotalHeight > 0) {
    entry.handleResize?.();
  }
}

function getVirtualTableHostName(element: JSXElement | null): string {
  if (!element || typeof element.type !== 'string') {
    return 'div';
  }

  return element.type.toLowerCase();
}

function renderVirtualTableColumns<Row>(
  columns: readonly VirtualTableColumn<Row>[]
) {
  return columns.map((column) => {
    const width =
      typeof column.width === 'number' ? `${column.width}px` : column.width;

    return <col key={column.id} style={{ width }} />;
  });
}

function renderVirtualTableHeader<Row>(
  columns: readonly VirtualTableColumn<Row>[]
) {
  return (
    <thead
      data-slot="virtual-table-head"
      style={{ position: 'sticky', top: 0, zIndex: 1 }}
    >
      <tr data-slot="virtual-table-header-row">
        {columns.map((column) => {
          const width =
            typeof column.width === 'number'
              ? `${column.width}px`
              : column.width;

          return (
            <th
              key={column.id}
              scope="col"
              data-slot="virtual-table-header-cell"
              data-column-id={column.id}
              style={{ width }}
            >
              {column.header}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function renderVirtualTableRows<Row>(
  entry: VirtualTableEntry<Row>,
  rows: readonly Row[],
  columns: readonly VirtualTableColumn<Row>[],
  visibleRange: VirtualRange,
  selectedKey: string | null,
  getKey: (row: Row, index: number) => string | number,
  onRowClick: (
    row: Row,
    rowIndex: number,
    rowKey: string,
    event: MouseEvent
  ) => void | undefined
) {
  const renderedRows: JSXElement[] = [];

  if (visibleRange.renderStartIndex === -1) {
    return renderedRows;
  }

  const colSpan = Math.max(1, columns.length);

  if (visibleRange.beforeSpacerHeight > 0) {
    renderedRows.push(
      <tr
        key="virtual-table-spacer-before"
        aria-hidden="true"
        data-slot="virtual-table-spacer-row"
      >
        <td
          colSpan={colSpan}
          style={{
            height: `${visibleRange.beforeSpacerHeight}px`,
            padding: 0,
            border: 0,
          }}
        />
      </tr>
    );
  }

  for (
    let index = visibleRange.renderStartIndex;
    index <= visibleRange.renderEndIndex;
    index += 1
  ) {
    const row = rows[index];
    const rowKey = String(getKey(row, index));
    const selected = selectedKey === rowKey;

    renderedRows.push(
      <tr
        key={rowKey}
        data-slot="virtual-table-row"
        data-row-index={String(index)}
        data-row-key={rowKey}
        data-selected={selected ? 'true' : 'false'}
        aria-rowindex={index + 1}
        aria-selected={selected ? 'true' : 'false'}
        style={{ height: `${entry.rowHeight}px` }}
        onClick={(event: MouseEvent) => {
          onRowClick(row, index, rowKey, event);
        }}
      >
        {columns.map((column) => {
          const CellComponent = column.cellComponent;

          return (
            <td
              key={column.id}
              data-slot="virtual-table-cell"
              data-column-id={column.id}
            >
              <CellComponent
                row={row}
                rowIndex={index}
                rowKey={rowKey}
                column={column}
                selected={selected}
              />
            </td>
          );
        })}
      </tr>
    );
  }

  if (visibleRange.afterSpacerHeight > 0) {
    renderedRows.push(
      <tr
        key="virtual-table-spacer-after"
        aria-hidden="true"
        data-slot="virtual-table-spacer-row"
      >
        <td
          colSpan={colSpan}
          style={{
            height: `${visibleRange.afterSpacerHeight}px`,
            padding: 0,
            border: 0,
          }}
        />
      </tr>
    );
  }

  return renderedRows;
}

export function VirtualTable<Row>(props: VirtualTableProps<Row>): JSX.Element;
export function VirtualTable<Row>(
  props: VirtualTableAsChildProps<Row>
): JSX.Element;
export function VirtualTable<Row>(
  props: VirtualTableProps<Row> | VirtualTableAsChildProps<Row>
): JSX.Element {
  const {
    asChild = false,
    apiRef,
    children,
    columns,
    defaultSelectedRowKey = null,
    getKey,
    headerHeight: headerHeightProp,
    onRowClick,
    onSelectedRowKeyChange,
    overscan = 0,
    ref,
    rowHeight: rowHeightProp,
    rows,
    selectedRowKey,
    tabIndex,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    onBlur,
    onFocus,
    onKeyDown,
    ...wrapperRest
  } = props;

  const rowHeight = assertPositiveVirtualHeight(rowHeightProp, 'rowHeight');
  const headerHeight = assertPositiveVirtualHeight(
    headerHeightProp,
    'headerHeight'
  );
  const instanceState = state(
    Symbol('virtual-table-instance')
  ) as StateCell<symbol>;
  const scrollTopState = state(0) as StateCell<number>;
  const viewportHeightState = state(0) as StateCell<number>;
  const entry = getVirtualTableEntry<Row>(
    instanceState(),
    scrollTopState,
    viewportHeightState
  );

  const selectedRowKeyState = state<string | null>(
    defaultSelectedRowKey
  ) as StateCell<string | null>;
  const selectedKeyState = (() => {
    const internalSelectedKey = selectedRowKeyState();

    return selectedRowKey !== undefined ? selectedRowKey : internalSelectedKey;
  }) as StateCell<string | null>;

  selectedKeyState.set = (nextOrUpdater) => {
    const currentSelectedKey =
      selectedRowKey !== undefined ? selectedRowKey : selectedRowKeyState();
    const nextSelectedKey =
      typeof nextOrUpdater === 'function'
        ? nextOrUpdater(currentSelectedKey)
        : nextOrUpdater;

    if (Object.is(currentSelectedKey, nextSelectedKey)) {
      return;
    }

    if (selectedRowKey !== undefined) {
      onSelectedRowKeyChange?.(nextSelectedKey);
      return;
    }

    selectedRowKeyState.set(nextSelectedKey);
    onSelectedRowKeyChange?.(nextSelectedKey);
  };
  const viewportHeightHint = resolveVirtualStyleHeight(wrapperRest.style);

  entry.userRef = ref;
  entry.apiRef = apiRef;
  entry.scrollTopState = scrollTopState;
  entry.viewportHeightState = viewportHeightState;
  entry.rowHeight = rowHeight;
  entry.headerHeight = headerHeight;
  entry.overscan = overscan;
  entry.columns = columns;
  entry.viewportHeightHint = viewportHeightHint;
  entry.selectedKeyState = selectedKeyState;
  entry.onRowClick = onRowClick;
  entry.getKey = getKey;

  setRefValue(entry.userRef, entry.wrapperNode);
  setRefValue(entry.apiRef, entry.api as VirtualTableApi<Row>);

  syncVirtualTableRows(entry, rows, getKey);

  const currentScrollTop = scrollTopState();
  const currentViewportHeight = viewportHeightState() || viewportHeightHint;
  const effectiveScrollTop =
    entry.pendingScrollTop !== null &&
    entry.pendingScrollTop !== currentScrollTop
      ? entry.pendingScrollTop
      : currentScrollTop;
  const bodyViewportHeight = Math.max(0, currentViewportHeight - headerHeight);
  const bodyScrollTop = Math.max(0, effectiveScrollTop - headerHeight);
  const visibleRange = resolveVirtualRange({
    totalCount: rows.length,
    rowHeight,
    scrollTop: bodyScrollTop,
    viewportHeight: bodyViewportHeight,
    overscan,
  });

  entry.visibleRange = visibleRange;

  const selectedRowKeySnapshot = selectedKeyState();
  const stateSnapshot = buildVirtualTableState(
    entry,
    visibleRange,
    currentScrollTop,
    currentViewportHeight,
    selectedRowKeySnapshot
  );
  const rootProps = mergeProps(wrapperRest, {
    ref: entry.rootRef,
    'data-slot': 'virtual-table',
    'data-virtual-table': 'true',
  });

  const tableProps = mergeProps(
    {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      'aria-rowcount': String(stateSnapshot.count),
      'aria-colcount': String(columns.length),
      tabIndex: tabIndex ?? 0,
      ...(onKeyDown ? { onKeyDown } : {}),
      ...(onFocus ? { onFocus } : {}),
      ...(onBlur ? { onBlur } : {}),
    },
    {
      ref: entry.tableRef,
      'data-slot': 'virtual-table-table',
      'data-virtual-table-table': 'true',
      onKeyDown: entry.handleKeyDown,
    }
  );

  const columnsMarkup = renderVirtualTableColumns(columns);
  const headerMarkup = renderVirtualTableHeader(columns);

  const rowsMarkup = renderVirtualTableRows(
    entry,
    rows,
    columns,
    visibleRange,
    selectedRowKeySnapshot,
    getKey,
    (row, rowIndex, rowKey, event) => {
      entry.selectedKeyState.set(rowKey);

      if (entry.tableNode) {
        entry.tableNode.focus();
      }

      const visible = entry.visibleRange;

      if (rowIndex < visible.visibleStartIndex) {
        entry.api.scrollToIndex(rowIndex, 'start');
      } else if (rowIndex > visible.visibleEndIndex) {
        entry.api.scrollToIndex(rowIndex, 'end');
      }

      onRowClick?.(row, rowIndex, rowKey, event);
    }
  );

  const tableBody = (
    <table {...tableProps} style={{ tableLayout: 'fixed' }}>
      {columnsMarkup.length > 0 ? <colgroup>{columnsMarkup}</colgroup> : null}
      {headerMarkup}
      <tbody data-slot="virtual-table-body">{rowsMarkup}</tbody>
    </table>
  );

  if (asChild) {
    if (!isJsxElement(children)) {
      throw new Error(
        'VirtualTable asChild mode requires a single JSX element host'
      );
    }

    const hostName = getVirtualTableHostName(children);

    if (
      hostName === 'table' ||
      hostName === 'thead' ||
      hostName === 'tbody' ||
      hostName === 'tfoot' ||
      hostName === 'tr' ||
      hostName === 'th' ||
      hostName === 'td' ||
      hostName === 'colgroup'
    ) {
      throw new Error(
        'VirtualTable asChild mode requires a non-table host element'
      );
    }

    return cloneJsxElement(
      children,
      {
        ...(rootProps as Record<string, unknown>),
        'data-virtual-scroll-top': String(currentScrollTop),
        'data-virtual-viewport-height': String(currentViewportHeight),
        'data-virtual-selected-row-key': selectedRowKeySnapshot ?? '',
      },
      tableBody
    );
  }

  return (
    <div
      {...rootProps}
      data-virtual-scroll-top={String(currentScrollTop)}
      data-virtual-viewport-height={String(currentViewportHeight)}
      data-virtual-selected-row-key={selectedRowKeySnapshot ?? ''}
    >
      {tableBody}
    </div>
  );
}
