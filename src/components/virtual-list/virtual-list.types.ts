import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import type {
  VirtualOverscan,
  VirtualRange,
  VirtualScrollAlignment,
} from '../_internal/virtualization';

type VirtualListRootProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'onScroll' | 'ref'
>;

/** Props for Virtual List Row Component. */
export type VirtualListRowComponentProps<Item> = {
  item: Item;
  index: number;
  rowKey: string;
  isVisible: boolean;
};

/** Virtual List Row Element. */
export type VirtualListRowElement = JSXElement | JSX.Element;

/** Virtual List Row Component. */
export type VirtualListRowComponent<Item> = (
  props: VirtualListRowComponentProps<Item>
) => VirtualListRowElement | null;

/** Virtual List Viewport. */
export type VirtualListViewport = 'lg';

/** Virtual List State. */
export type VirtualListState = {
  count: number;
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
  visibleRange: VirtualRange;
  isAtTop: boolean;
  isAtBottom: boolean;
  followBottom: boolean;
  pendingUnseenCount: number;
};

/** Virtual List Api. */
export type VirtualListApi<_Item> = {
  scrollToIndex: (index: number, alignment?: VirtualScrollAlignment) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getState: () => VirtualListState;
  getVisibleRange: () => VirtualRange;
  getItemCount: () => number;
  getScrollTop: () => number;
  isAtTop: () => boolean;
  isAtBottom: () => boolean;
  isFollowingBottom: () => boolean;
  getPendingUnseenCount: () => number;
  setFollowBottom: (followBottom: boolean) => void;
};

/** Props for Virtual List. */
export type VirtualListProps<Item> = VirtualListRootProps & {
  items: readonly Item[];
  rowHeight: number;
  /** Optional keyed row sizing. When omitted, VirtualList retains its fixed-height arithmetic path. */
  getRowHeight?: (item: Item, index: number) => number;
  overscan?: VirtualOverscan;
  getKey: (item: Item, index: number) => string | number;
  rowComponent: VirtualListRowComponent<Item>;
  followBottom?: boolean | { threshold?: number };
  onScroll?: (event: Event) => void;
  viewport?: VirtualListViewport;
  apiRef?: Ref<VirtualListApi<Item> | null>;
  ref?: Ref<HTMLElement>;
  asChild?: false;
};

/** Props for the `asChild` (polymorphic) rendering of Virtual List. */
export type VirtualListAsChildProps<Item> = Omit<
  VirtualListRootProps,
  'children'
> & {
  items: readonly Item[];
  rowHeight: number;
  /** Optional keyed row sizing. When omitted, VirtualList retains its fixed-height arithmetic path. */
  getRowHeight?: (item: Item, index: number) => number;
  overscan?: VirtualOverscan;
  getKey: (item: Item, index: number) => string | number;
  rowComponent: VirtualListRowComponent<Item>;
  followBottom?: boolean | { threshold?: number };
  onScroll?: (event: Event) => void;
  viewport?: VirtualListViewport;
  apiRef?: Ref<VirtualListApi<Item> | null>;
  ref?: Ref<HTMLElement>;
  asChild: true;
  children: JSXElement;
};
