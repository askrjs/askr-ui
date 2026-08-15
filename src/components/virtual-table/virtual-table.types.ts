import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import type {
  VirtualOverscan,
  VirtualRange,
  VirtualScrollAlignment,
} from '../_internal/virtualization';

type VirtualTableRootProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'onScroll' | 'ref'
>;

/** Props for Virtual Table Cell Component. */
export type VirtualTableCellComponentProps<Row> = {
  row: Row;
  rowIndex: number;
  rowKey: string;
  column: VirtualTableColumn<Row>;
  selected: boolean;
};

/** Virtual Table Cell Element. */
export type VirtualTableCellElement = JSXElement | JSX.Element;

/** Virtual Table Cell Component. */
export type VirtualTableCellComponent<Row> = (
  props: VirtualTableCellComponentProps<Row>
) => VirtualTableCellElement | null;

/** Virtual Table Viewport. */
export type VirtualTableViewport = 'lg';

/** Virtual Table Width. */
export type VirtualTableWidth = 'compact';

/** Virtual Table Column. */
export type VirtualTableColumn<Row> = {
  id: string;
  header: JSXElement | string;
  width?: number | string;
  cellComponent: VirtualTableCellComponent<Row>;
};

/** Virtual Table State. */
export type VirtualTableState = {
  count: number;
  rowHeight: number;
  headerHeight: number;
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
  visibleRange: VirtualRange;
  isAtTop: boolean;
  isAtBottom: boolean;
  selectedRowKey: string | null;
  selectedRowIndex: number;
};

/** Virtual Table Api. */
export type VirtualTableApi<_Row> = {
  scrollToIndex: (index: number, alignment?: VirtualScrollAlignment) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getState: () => VirtualTableState;
  getVisibleRange: () => VirtualRange;
  getRowCount: () => number;
  getScrollTop: () => number;
  isAtTop: () => boolean;
  isAtBottom: () => boolean;
  getSelectedRowKey: () => string | null;
  getSelectedRowIndex: () => number;
  selectRowByKey: (rowKey: string) => void;
  selectRowByIndex: (index: number) => void;
  clearSelection: () => void;
};

/** Props for Virtual Table. */
export type VirtualTableProps<Row> = VirtualTableRootProps & {
  rows: readonly Row[];
  rowHeight: number;
  headerHeight: number;
  overscan?: VirtualOverscan;
  getKey: (row: Row, index: number) => string | number;
  columns: readonly VirtualTableColumn<Row>[];
  selectedRowKey?: string | null;
  defaultSelectedRowKey?: string | null;
  onSelectedRowKeyChange?: (next: string | null) => void;
  onRowClick?: (
    row: Row,
    rowIndex: number,
    rowKey: string,
    event: MouseEvent
  ) => void;
  onScroll?: (event: Event) => void;
  viewport?: VirtualTableViewport;
  tableWidth?: VirtualTableWidth;
  apiRef?: Ref<VirtualTableApi<Row> | null>;
  ref?: Ref<HTMLElement>;
  asChild?: false;
};

/** Props for the `asChild` (polymorphic) rendering of Virtual Table. */
export type VirtualTableAsChildProps<Row> = Omit<
  VirtualTableRootProps,
  'children'
> & {
  rows: readonly Row[];
  rowHeight: number;
  headerHeight: number;
  overscan?: VirtualOverscan;
  getKey: (row: Row, index: number) => string | number;
  columns: readonly VirtualTableColumn<Row>[];
  selectedRowKey?: string | null;
  defaultSelectedRowKey?: string | null;
  onSelectedRowKeyChange?: (next: string | null) => void;
  onRowClick?: (
    row: Row,
    rowIndex: number,
    rowKey: string,
    event: MouseEvent
  ) => void;
  onScroll?: (event: Event) => void;
  viewport?: VirtualTableViewport;
  tableWidth?: VirtualTableWidth;
  apiRef?: Ref<VirtualTableApi<Row> | null>;
  ref?: Ref<HTMLElement>;
  asChild: true;
  children: JSXElement;
};
