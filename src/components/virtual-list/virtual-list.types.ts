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

export type VirtualListRowComponentProps<Item> = {
  item: Item;
  index: number;
  rowKey: string;
  isVisible: boolean;
};

export type VirtualListRowElement = JSXElement | JSX.Element;

export type VirtualListRowComponent<Item> = (
  props: VirtualListRowComponentProps<Item>
) => VirtualListRowElement | null;

export type VirtualListViewport = 'lg';

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

export type VirtualListProps<Item> = VirtualListRootProps & {
  items: readonly Item[];
  rowHeight: number;
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

export type VirtualListAsChildProps<Item> = Omit<
  VirtualListRootProps,
  'children'
> & {
  items: readonly Item[];
  rowHeight: number;
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
