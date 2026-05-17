import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import {
  VirtualList,
  VirtualTable,
  type VirtualListApi,
  type VirtualListAsChildProps,
  type VirtualListProps,
  type VirtualListRowComponent,
  type VirtualListRowComponentProps,
  type VirtualListState,
  type VirtualTableApi,
  type VirtualTableAsChildProps,
  type VirtualTableCellComponent,
  type VirtualTableCellComponentProps,
  type VirtualTableColumn,
  type VirtualTableProps,
  type VirtualTableState,
} from '@askrjs/ui';
import { VirtualList as VirtualListSubpath } from '@askrjs/ui/virtual-list';
import { VirtualTable as VirtualTableSubpath } from '@askrjs/ui/virtual-table';

const slotChild = {} as JSXElement;

type Item = {
  id: string;
  label: string;
};

type Row = {
  id: string;
  name: string;
};

const virtualListFromSubpath: typeof VirtualList = VirtualListSubpath;
const virtualTableFromSubpath: typeof VirtualTable = VirtualTableSubpath;

const virtualListRowComponentProps: VirtualListRowComponentProps<Item> = {
  item: { id: 'item-1', label: 'Item 1' },
  index: 0,
  rowKey: 'item-1',
  isVisible: true,
};
const virtualListRowComponent: VirtualListRowComponent<Item> = ({
  item: _item,
}) => slotChild;
const virtualListApiRef = {} as Ref<VirtualListApi<Item> | null>;
const virtualListState: VirtualListState = {
  count: 1,
  scrollTop: 0,
  viewportHeight: 0,
  totalHeight: 32,
  visibleRange: {
    totalCount: 1,
    rowHeight: 32,
    scrollTop: 0,
    viewportHeight: 32,
    totalHeight: 32,
    visibleStartIndex: 0,
    visibleEndIndex: 0,
    renderStartIndex: 0,
    renderEndIndex: 0,
    visibleCount: 1,
    beforeSpacerHeight: 0,
    afterSpacerHeight: 0,
    renderedCount: 1,
    isAtTop: true,
    isAtBottom: true,
  },
  isAtTop: true,
  isAtBottom: true,
  followBottom: false,
  pendingUnseenCount: 0,
};
const virtualListProps: VirtualListProps<Item> = {
  items: [{ id: 'item-1', label: 'Item 1' }],
  rowHeight: 32,
  getKey: (item) => item.id,
  rowComponent: virtualListRowComponent,
  apiRef: virtualListApiRef,
  followBottom: false,
};
const virtualListAsChildProps: VirtualListAsChildProps<Item> = {
  asChild: true,
  children: slotChild,
  items: [{ id: 'item-1', label: 'Item 1' }],
  rowHeight: 32,
  getKey: (item) => item.id,
  rowComponent: virtualListRowComponent,
  apiRef: virtualListApiRef,
};

const virtualTableCellComponentProps: VirtualTableCellComponentProps<Row> = {
  row: { id: 'row-1', name: 'Row 1' },
  rowIndex: 0,
  rowKey: 'row-1',
  column: {
    id: 'name',
    header: 'Name',
    cellComponent: ({ row: _row }) => slotChild,
  },
  selected: false,
};
const virtualTableCellComponent: VirtualTableCellComponent<Row> = ({
  row: _row,
}) => slotChild;
const virtualTableApiRef = {} as Ref<VirtualTableApi<Row> | null>;
const virtualTableColumns: readonly VirtualTableColumn<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    cellComponent: virtualTableCellComponent,
  },
];
const virtualTableState: VirtualTableState = {
  count: 1,
  rowHeight: 32,
  headerHeight: 32,
  scrollTop: 0,
  viewportHeight: 0,
  totalHeight: 64,
  visibleRange: {
    totalCount: 1,
    rowHeight: 32,
    scrollTop: 0,
    viewportHeight: 32,
    totalHeight: 32,
    visibleStartIndex: 0,
    visibleEndIndex: 0,
    renderStartIndex: 0,
    renderEndIndex: 0,
    visibleCount: 1,
    beforeSpacerHeight: 0,
    afterSpacerHeight: 0,
    renderedCount: 1,
    isAtTop: true,
    isAtBottom: true,
  },
  isAtTop: true,
  isAtBottom: true,
  selectedRowKey: null,
  selectedRowIndex: -1,
};
const virtualTableProps: VirtualTableProps<Row> = {
  rows: [{ id: 'row-1', name: 'Row 1' }],
  rowHeight: 32,
  headerHeight: 32,
  getKey: (row) => row.id,
  columns: virtualTableColumns,
  apiRef: virtualTableApiRef,
};
const virtualTableAsChildProps: VirtualTableAsChildProps<Row> = {
  asChild: true,
  children: slotChild,
  rows: [{ id: 'row-1', name: 'Row 1' }],
  rowHeight: 32,
  headerHeight: 32,
  getKey: (row) => row.id,
  columns: virtualTableColumns,
  apiRef: virtualTableApiRef,
};

void [
  virtualListFromSubpath,
  virtualTableFromSubpath,
  VirtualList,
  VirtualTable,
  virtualListRowComponentProps,
  virtualListRowComponent,
  virtualListState,
  virtualListProps,
  virtualListAsChildProps,
  virtualTableCellComponentProps,
  virtualTableCellComponent,
  virtualTableState,
  virtualTableProps,
  virtualTableAsChildProps,
];
