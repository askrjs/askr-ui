import { cspNonce, state } from '@askrjs/askr';
import type { JSXElement } from '@askrjs/askr/foundations/structures';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { mergeProps } from '@askrjs/askr/foundations/utilities';
import {
  assertPositiveVirtualHeight,
  buildVirtualKeyIndexMap,
  createVirtualAnchor,
  resolveVirtualAppendedCount,
  resolveVirtualRange,
  resolveVirtualRetainedAnchorKey,
  resolveVirtualScrollTopForBottom,
  resolveVirtualScrollTopForIndex,
  resolveVirtualScrollTopFromAnchor,
  resolveVirtualTotalHeight,
  resolveVirtualIsAtBottom,
  resolveVirtualStyleHeight,
  setRefValue,
  type VirtualOverscan,
  type VirtualRange,
} from '../_internal/virtualization';
import { isJsxElement } from '../_internal/jsx';
import {
  dynamicAttributeSelector,
  removeDynamicStyleRuleWhenUnused,
  setDynamicStyleRule,
} from '../_internal/dynamic-style';
import type {
  VirtualListApi,
  VirtualListAsChildProps,
  VirtualListProps,
  VirtualListRowComponent,
  VirtualListState,
} from './virtual-list.types';

type StateCell<T> = (() => T) & {
  set: (next: T | ((prev: T) => T)) => void;
};

function virtualListLayoutProps<Item>(
  entry: VirtualListEntry<Item>,
  kind: 'row' | 'spacer',
  height: number
): Record<string, string> {
  const value = String(height);
  const attribute = `data-askr-virtual-list-${kind}-height`;
  const key = `virtual-list:${kind}:${value}`;
  const selector = dynamicAttributeSelector(attribute, value);
  setDynamicStyleRule(
    key,
    selector,
    {
      height: `${height}px`,
      'list-style': 'none',
      flex: '0 0 auto',
      overflow: 'hidden',
      ...(kind === 'spacer' ? { 'pointer-events': 'none' } : {}),
    },
    entry.layoutNonce
  );
  entry.nextLayoutRules.set(key, selector);
  return { [attribute]: value };
}

function commitVirtualListLayoutRules<Item>(entry: VirtualListEntry<Item>) {
  for (const [key, selector] of entry.layoutRules) {
    if (!entry.nextLayoutRules.has(key)) {
      removeDynamicStyleRuleWhenUnused(key, selector);
    }
  }
  entry.layoutRules = entry.nextLayoutRules;
  entry.nextLayoutRules = new Map();
}

type VirtualListEntry<Item> = {
  node: HTMLElement | null;
  userRef: Ref<HTMLElement> | undefined;
  apiRef: Ref<VirtualListApi<Item> | null> | undefined;
  scrollTopState: StateCell<number>;
  viewportHeightState: StateCell<number>;
  renderVersionState: StateCell<number> | undefined;
  viewportHeightHint: number;
  rowHeight: number;
  overscan: VirtualOverscan;
  rowComponent: VirtualListRowComponent<Item>;
  itemsRef: readonly Item[] | null;
  keys: string[];
  keyIndexMap: Map<string, number>;
  followBottomEnabled: boolean;
  followBottomActive: boolean;
  followBottomThreshold: number;
  pendingUnseenCount: number;
  pendingScrollTop: number | null;
  pendingCommitFrame: number | null;
  resizeCommitFrame: number | null;
  resizeObserver: ResizeObserver | null;
  windowResizeHandler: (() => void) | null;
  rootRef: (node: HTMLElement | null) => void;
  handleScroll: (() => void) | undefined;
  handleResize: (() => void) | undefined;
  schedulePendingScrollTop: () => void;
  api: VirtualListApi<Item>;
  visibleRange: VirtualRange;
  onScroll: ((event: Event) => void) | undefined;
  layoutRules: Map<string, string>;
  nextLayoutRules: Map<string, string>;
  layoutNonce: string | undefined;
};

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

const virtualListEntries = new WeakMap<object, VirtualListEntry<unknown>>();

function getVirtualListEntry<Item>(key: object): VirtualListEntry<Item> {
  const existing = virtualListEntries.get(key);
  if (existing) {
    return existing as VirtualListEntry<Item>;
  }

  const entry = {} as VirtualListEntry<Item>;
  entry.layoutRules = new Map();
  entry.nextLayoutRules = new Map();
  const readScrollTop = () => entry.scrollTopState!();
  const setScrollTop = (nextScrollTop: number) => {
    entry.scrollTopState!.set(nextScrollTop);
  };
  const readViewportHeight = () => entry.viewportHeightState!();
  const setViewportHeight = (nextViewportHeight: number) => {
    entry.viewportHeightState!.set(nextViewportHeight);
  };
  const getCurrentVisibleRange = () => {
    const currentScrollTop = readScrollTop();
    const currentViewportHeight =
      readViewportHeight() || entry.viewportHeightHint;
    const effectiveScrollTop =
      entry.pendingScrollTop !== null &&
      entry.pendingScrollTop !== currentScrollTop
        ? entry.pendingScrollTop
        : currentScrollTop;

    return resolveVirtualRange({
      totalCount: entry.keys.length,
      rowHeight: entry.rowHeight,
      scrollTop: effectiveScrollTop,
      viewportHeight: currentViewportHeight,
      overscan: entry.overscan,
    });
  };

  const bumpRenderVersion = () => {
    entry.renderVersionState?.set((currentVersion) => currentVersion + 1);
  };

  const applyPendingScrollTop = () => {
    const pendingScrollTop = entry.pendingScrollTop;
    const node = entry.node;

    if (pendingScrollTop === null || !node) {
      return;
    }

    const viewportHeight = readViewportHeight() || entry.viewportHeightHint;
    const maxScrollTop = resolveVirtualScrollTopForBottom(
      resolveVirtualTotalHeight(entry.keys.length, entry.rowHeight),
      viewportHeight
    );
    const nextScrollTop = Math.min(Math.max(0, pendingScrollTop), maxScrollTop);
    entry.pendingScrollTop = null;

    if (node.scrollTop !== nextScrollTop) {
      node.scrollTop = nextScrollTop;
    }

    if (readScrollTop() !== nextScrollTop) {
      setScrollTop(nextScrollTop);
    }

    entry.handleScroll?.();
  };

  const updateVisibleRange = (scrollTop: number, viewportHeight: number) => {
    entry.visibleRange = resolveVirtualRange({
      totalCount: entry.keys.length,
      rowHeight: entry.rowHeight,
      scrollTop,
      viewportHeight,
      overscan: entry.overscan,
    });
  };

  const schedulePendingScrollTop = () => {
    if (entry.pendingScrollTop === null || entry.pendingCommitFrame !== null) {
      return;
    }

    if (typeof requestAnimationFrame !== 'function') {
      applyPendingScrollTop();
      return;
    }

    // Defer the DOM write until after the render commit so anchor correction
    // happens against the updated item window, not the stale tree.
    entry.pendingCommitFrame = requestAnimationFrame(() => {
      entry.pendingCommitFrame = null;
      applyPendingScrollTop();
    });
  };

  const handleScroll = (event?: Event) => {
    const node = entry.node;

    if (!node) {
      return;
    }

    // Read the live scroll position from the viewport so visible range math
    // stays aligned with the browser's actual scroll state.
    const nextScrollTop = node.scrollTop;

    if (event && entry.pendingScrollTop !== null) {
      entry.pendingScrollTop = null;
      if (entry.pendingCommitFrame !== null) {
        cancelAnimationFrame(entry.pendingCommitFrame);
        entry.pendingCommitFrame = null;
      }
    }

    if (readScrollTop() !== nextScrollTop) {
      setScrollTop(nextScrollTop);
    }

    const totalHeight = resolveVirtualTotalHeight(
      entry.keys.length,
      entry.rowHeight
    );
    const viewportHeight = readViewportHeight();
    const isAtBottom = resolveVirtualIsAtBottom(
      nextScrollTop,
      viewportHeight,
      totalHeight,
      entry.followBottomThreshold
    );

    if (entry.followBottomEnabled) {
      entry.followBottomActive = isAtBottom;

      if (isAtBottom) {
        entry.pendingUnseenCount = 0;
      }
    }

    updateVisibleRange(nextScrollTop, viewportHeight);
    bumpRenderVersion();

    if (event) {
      entry.onScroll?.(event);
    }
  };

  const handleResize = () => {
    const node = entry.node;

    if (!node) {
      return;
    }

    // The viewport height is a layout read, but virtualization needs the live
    // container size to keep the window math and scroll clamping correct.
    const nextViewportHeight =
      node.clientHeight || Number.parseFloat(node.style.height || '') || 0;

    if (readViewportHeight() !== nextViewportHeight) {
      setViewportHeight(nextViewportHeight);
    }

    const totalHeight = resolveVirtualTotalHeight(
      entry.keys.length,
      entry.rowHeight
    );
    const maxScrollTop = resolveVirtualScrollTopForBottom(
      totalHeight,
      nextViewportHeight
    );

    if (entry.followBottomEnabled && entry.followBottomActive) {
      if (node.scrollTop !== maxScrollTop) {
        node.scrollTop = maxScrollTop;
        if (readScrollTop() !== maxScrollTop) {
          setScrollTop(maxScrollTop);
        }
      }
      return;
    }

    if (node.scrollTop > maxScrollTop) {
      node.scrollTop = maxScrollTop;
      if (readScrollTop() !== maxScrollTop) {
        setScrollTop(maxScrollTop);
      }
    }

    updateVisibleRange(
      readScrollTop(),
      readViewportHeight() || entry.viewportHeightHint
    );
    bumpRenderVersion();
  };

  const scheduleResize = () => {
    if (entry.resizeCommitFrame !== null) {
      return;
    }

    if (typeof requestAnimationFrame !== 'function') {
      entry.resizeCommitFrame = -1;
      queueMicrotask(() => {
        entry.resizeCommitFrame = null;
        handleResize();
      });
      return;
    }

    // ResizeObserver callbacks are measurement-only. Defer every state/DOM
    // write until the next frame so the observer delivery cannot feed back
    // into the same browser resize cycle.
    entry.resizeCommitFrame = requestAnimationFrame(() => {
      entry.resizeCommitFrame = null;
      handleResize();
    });
  };

  const rootRef = (node: HTMLElement | null) => {
    setRefValue(entry.userRef, node);

    if (entry.node === node) {
      return;
    }

    if (node === null) {
      for (const [key, selector] of entry.layoutRules) {
        removeDynamicStyleRuleWhenUnused(key, selector);
      }
      entry.layoutRules.clear();
    }

    if (entry.pendingCommitFrame !== null) {
      cancelAnimationFrame(entry.pendingCommitFrame);
      entry.pendingCommitFrame = null;
    }

    if (entry.resizeCommitFrame !== null) {
      if (entry.resizeCommitFrame >= 0) {
        cancelAnimationFrame(entry.resizeCommitFrame);
      }
      entry.resizeCommitFrame = null;
    }

    entry.resizeObserver?.disconnect();
    entry.resizeObserver = null;

    if (entry.windowResizeHandler) {
      window.removeEventListener('resize', entry.windowResizeHandler);
      entry.windowResizeHandler = null;
    }

    if (entry.node) {
      entry.node.removeEventListener('scroll', handleScroll);
    }

    entry.node = node;

    if (!node) {
      setRefValue(entry.apiRef, null);
      return;
    }

    queueMicrotask(() => {
      if (entry.node !== node) {
        return;
      }

      // Read the live container height once on mount so the initial render can
      // clamp the window before the first scroll interaction.
      const nextViewportHeight =
        node.clientHeight || Number.parseFloat(node.style.height || '') || 0;
      setViewportHeight(nextViewportHeight);
      setScrollTop(node.scrollTop);
      bumpRenderVersion();

      node.addEventListener('scroll', handleScroll, { passive: true });

      if (typeof ResizeObserver !== 'undefined') {
        entry.resizeObserver = new ResizeObserver(() => {
          scheduleResize();
        });
        entry.resizeObserver.observe(node);
      } else {
        entry.windowResizeHandler = handleResize;
        window.addEventListener('resize', handleResize);
      }

      handleScroll();
      handleResize();
      schedulePendingScrollTop();

      setRefValue(entry.apiRef, entry.api as VirtualListApi<Item>);
    });
  };

  const api: VirtualListApi<Item> = {
    scrollToIndex(index, alignment = 'start') {
      const node = entry.node;
      const viewportHeight = readViewportHeight() || entry.viewportHeightHint;
      const nextScrollTop = resolveVirtualScrollTopForIndex(
        index,
        entry.rowHeight,
        viewportHeight,
        entry.keys.length,
        alignment
      );

      entry.followBottomActive = alignment === 'end';
      entry.pendingUnseenCount = 0;
      entry.pendingScrollTop = nextScrollTop;
      entry.schedulePendingScrollTop();

      if (node && node.scrollTop !== nextScrollTop) {
        node.scrollTop = nextScrollTop;
      }

      updateVisibleRange(nextScrollTop, viewportHeight);
      bumpRenderVersion();
    },
    scrollToTop() {
      this.scrollToIndex(0, 'start');
    },
    scrollToBottom() {
      const node = entry.node;
      const viewportHeight = readViewportHeight() || entry.viewportHeightHint;
      const totalHeight = resolveVirtualTotalHeight(
        entry.keys.length,
        entry.rowHeight
      );
      const nextScrollTop = resolveVirtualScrollTopForBottom(
        totalHeight,
        viewportHeight
      );

      entry.pendingScrollTop = nextScrollTop;
      entry.schedulePendingScrollTop();

      if (node && node.scrollTop !== nextScrollTop) {
        node.scrollTop = nextScrollTop;
      }

      entry.followBottomActive = true;
      entry.pendingUnseenCount = 0;

      updateVisibleRange(nextScrollTop, viewportHeight);
      bumpRenderVersion();
    },
    getState() {
      const visibleRange = getCurrentVisibleRange();
      const scrollTop =
        entry.pendingScrollTop !== null
          ? entry.pendingScrollTop
          : readScrollTop();
      const viewportHeight = readViewportHeight() || entry.viewportHeightHint;

      return buildVirtualListState(
        entry,
        visibleRange,
        scrollTop,
        viewportHeight
      );
    },
    getVisibleRange() {
      return getCurrentVisibleRange();
    },
    getItemCount() {
      return entry.keys.length;
    },
    getScrollTop() {
      return entry.pendingScrollTop !== null
        ? entry.pendingScrollTop
        : readScrollTop();
    },
    isAtTop() {
      return getCurrentVisibleRange().isAtTop;
    },
    isAtBottom() {
      return getCurrentVisibleRange().isAtBottom;
    },
    isFollowingBottom() {
      return entry.followBottomEnabled && entry.followBottomActive;
    },
    getPendingUnseenCount() {
      return entry.pendingUnseenCount;
    },
    setFollowBottom(nextFollowBottom: boolean) {
      entry.followBottomEnabled = nextFollowBottom;
      entry.followBottomActive =
        nextFollowBottom && entry.visibleRange.isAtBottom;

      if (!nextFollowBottom) {
        entry.pendingUnseenCount = 0;
      } else if (entry.visibleRange.isAtBottom) {
        entry.pendingUnseenCount = 0;
      }
    },
  };

  entry.api = api;
  entry.rootRef = rootRef;
  entry.handleScroll = handleScroll;
  entry.handleResize = handleResize;
  entry.schedulePendingScrollTop = schedulePendingScrollTop;
  entry.resizeObserver = null;
  entry.windowResizeHandler = null;
  entry.node = entry.node ?? null;
  entry.userRef = entry.userRef ?? undefined;
  entry.apiRef = entry.apiRef ?? undefined;
  entry.rowHeight = entry.rowHeight ?? 0;
  entry.overscan = entry.overscan ?? 0;
  entry.rowComponent = entry.rowComponent ?? (() => null as never);
  entry.itemsRef = entry.itemsRef ?? null;
  entry.keys = entry.keys ?? [];
  entry.keyIndexMap = entry.keyIndexMap ?? new Map<string, number>();
  entry.followBottomEnabled = entry.followBottomEnabled ?? false;
  entry.followBottomActive = entry.followBottomActive ?? false;
  entry.followBottomThreshold = entry.followBottomThreshold ?? 0;
  entry.pendingUnseenCount = entry.pendingUnseenCount ?? 0;
  entry.pendingScrollTop = entry.pendingScrollTop ?? null;
  entry.pendingCommitFrame = entry.pendingCommitFrame ?? null;
  entry.resizeCommitFrame = entry.resizeCommitFrame ?? null;
  entry.visibleRange =
    entry.visibleRange ??
    resolveVirtualRange({
      totalCount: 0,
      rowHeight: 1,
      scrollTop: 0,
      viewportHeight: 0,
      overscan: 0,
    });

  virtualListEntries.set(key, entry as VirtualListEntry<unknown>);
  return entry as VirtualListEntry<Item>;
}

function getListHostElementName(element: JSXElement | null): string {
  if (!element || typeof element.type !== 'string') {
    return 'div';
  }

  return element.type.toLowerCase();
}

function buildVirtualListState<Item>(
  entry: VirtualListEntry<Item>,
  visibleRange: VirtualRange,
  scrollTop: number,
  viewportHeight: number
): VirtualListState {
  const totalHeight = resolveVirtualTotalHeight(
    entry.keys.length,
    entry.rowHeight
  );

  return {
    count: entry.keys.length,
    scrollTop,
    viewportHeight,
    totalHeight,
    visibleRange,
    isAtTop: visibleRange.isAtTop,
    isAtBottom: visibleRange.isAtBottom,
    followBottom: entry.followBottomEnabled && entry.followBottomActive,
    pendingUnseenCount: entry.pendingUnseenCount,
  };
}

function renderVirtualListRows<Item>(
  entry: VirtualListEntry<Item>,
  items: readonly Item[],
  getKey: (item: Item, index: number) => string | number,
  visibleRange: VirtualRange,
  rendersSemanticListItems: boolean
) {
  const rows: JSXElement[] = [];

  if (visibleRange.renderStartIndex === -1) {
    return rows;
  }

  const RowHost = rendersSemanticListItems ? 'li' : 'div';

  const pushSpacer = (position: 'before' | 'after', height: number) => {
    if (height <= 0) {
      return;
    }

    rows.push(
      <RowHost
        key={`virtual-list-spacer-${position}`}
        aria-hidden="true"
        data-slot="virtual-list-spacer"
        data-position={position}
        {...virtualListLayoutProps(entry, 'spacer', height)}
      />
    );
  };

  pushSpacer('before', visibleRange.beforeSpacerHeight);

  for (
    let index = visibleRange.renderStartIndex;
    index <= visibleRange.renderEndIndex;
    index += 1
  ) {
    const item = items[index];
    const rowKey = String(getKey(item, index));
    const isVisible =
      index >= visibleRange.visibleStartIndex &&
      index <= visibleRange.visibleEndIndex;
    const RowComponent = entry.rowComponent;

    rows.push(
      <RowHost
        key={rowKey}
        role={rendersSemanticListItems ? undefined : 'listitem'}
        aria-posinset={index + 1}
        aria-setsize={entry.keys.length}
        data-slot="virtual-list-row"
        data-index={String(index)}
        data-key={rowKey}
        data-visible={isVisible ? 'true' : 'false'}
        {...virtualListLayoutProps(entry, 'row', entry.rowHeight)}
      >
        <RowComponent
          item={item}
          index={index}
          rowKey={rowKey}
          isVisible={isVisible}
        />
      </RowHost>
    );
  }

  pushSpacer('after', visibleRange.afterSpacerHeight);

  return rows;
}

function syncVirtualListItems<Item>(
  entry: VirtualListEntry<Item>,
  items: readonly Item[],
  getKey: (item: Item, index: number) => string | number
) {
  const previousKeys = entry.keys;
  const itemsChanged = entry.itemsRef !== items;

  if (!itemsChanged) {
    return;
  }

  const nextKeys = items.map((item, index) => String(getKey(item, index)));
  const nextKeyIndexMap = buildVirtualKeyIndexMap(nextKeys);
  const previousVisibleKeys =
    entry.visibleRange.visibleStartIndex < 0
      ? []
      : previousKeys.slice(
          entry.visibleRange.visibleStartIndex,
          entry.visibleRange.visibleEndIndex + 1
        );
  const currentScrollTop =
    entry.pendingScrollTop !== null
      ? entry.pendingScrollTop
      : entry.scrollTopState();
  const currentViewportHeight =
    entry.viewportHeightState() || entry.viewportHeightHint;
  const currentTotalHeight = resolveVirtualTotalHeight(
    previousKeys.length,
    entry.rowHeight
  );
  const nextTotalHeight = resolveVirtualTotalHeight(
    nextKeys.length,
    entry.rowHeight
  );
  const bottomPinned =
    entry.followBottomEnabled &&
    entry.followBottomActive &&
    resolveVirtualIsAtBottom(
      currentScrollTop,
      currentViewportHeight,
      currentTotalHeight,
      entry.followBottomThreshold
    );

  if (bottomPinned) {
    entry.followBottomActive = true;
    entry.pendingUnseenCount = 0;
    entry.pendingScrollTop = resolveVirtualScrollTopForBottom(
      nextTotalHeight,
      currentViewportHeight
    );
  } else {
    const anchorKey = resolveVirtualRetainedAnchorKey(
      previousVisibleKeys,
      nextKeyIndexMap
    );

    if (anchorKey) {
      const anchor = createVirtualAnchor(
        previousVisibleKeys,
        entry.visibleRange.visibleStartIndex,
        currentScrollTop,
        entry.rowHeight
      );

      if (anchor) {
        const nextScrollTop = resolveVirtualScrollTopFromAnchor(
          anchor,
          nextKeyIndexMap,
          entry.rowHeight
        );

        if (nextScrollTop !== null) {
          entry.pendingScrollTop = nextScrollTop;
        }
      }
    }

    const appendedCount = resolveVirtualAppendedCount(previousKeys, nextKeys);

    if (entry.followBottomEnabled && appendedCount > 0) {
      entry.pendingUnseenCount += appendedCount;
    }
  }

  entry.keys = nextKeys;
  entry.keyIndexMap = nextKeyIndexMap;
  entry.itemsRef = items;

  const maxScrollTop = resolveVirtualScrollTopForBottom(
    nextTotalHeight,
    currentViewportHeight
  );
  entry.pendingScrollTop = Math.min(
    Math.max(0, entry.pendingScrollTop ?? currentScrollTop),
    maxScrollTop
  );

  if (entry.pendingScrollTop !== null) {
    entry.schedulePendingScrollTop();
  }
}

/**
 * Renders a part of `virtual-list`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function VirtualList<Item>(props: VirtualListProps<Item>): JSX.Element;
export function VirtualList<Item>(
  props: VirtualListAsChildProps<Item>
): JSX.Element;
export function VirtualList<Item>(
  props: VirtualListProps<Item> | VirtualListAsChildProps<Item>
): JSX.Element {
  const {
    asChild = false,
    apiRef,
    children,
    followBottom = false,
    getKey,
    items,
    overscan = 0,
    ref,
    rowComponent: RowComponent,
    rowHeight: rowHeightProp,
    onScroll,
    viewport,
    ...rest
  } = props as (VirtualListProps<Item> | VirtualListAsChildProps<Item>) & {
    onScroll?: (event: Event) => void;
  };

  const rowHeight = assertPositiveVirtualHeight(rowHeightProp, 'rowHeight');
  const layoutNonce = cspNonce();
  const instanceState = state({}) as StateCell<object>;
  const entry = getVirtualListEntry<Item>(instanceState());
  const scrollTopState = state(0) as StateCell<number>;
  const viewportHeightState = state(0) as StateCell<number>;
  const renderVersionState = state(0) as StateCell<number>;
  entry.renderVersionState = renderVersionState;
  const renderVersion = renderVersionState();
  const viewportHeightHint = resolveVirtualStyleHeight(rest.style);

  entry.userRef = ref;
  entry.apiRef = apiRef;
  entry.scrollTopState = scrollTopState;
  entry.viewportHeightState = viewportHeightState;
  entry.rowHeight = rowHeight;
  entry.layoutNonce = layoutNonce;
  entry.viewportHeightHint = viewportHeightHint;
  entry.overscan = overscan;
  entry.rowComponent = RowComponent;
  entry.onScroll = onScroll;
  entry.followBottomEnabled = Boolean(followBottom);
  entry.followBottomThreshold =
    typeof followBottom === 'boolean'
      ? rowHeight
      : Math.max(0, followBottom.threshold ?? rowHeight);

  setRefValue(entry.userRef, entry.node);
  setRefValue(entry.apiRef, entry.api as VirtualListApi<Item>);

  syncVirtualListItems(entry, items, getKey);

  const currentScrollTop = entry.scrollTopState();
  const effectiveScrollTop =
    entry.pendingScrollTop !== null &&
    entry.pendingScrollTop !== currentScrollTop
      ? entry.pendingScrollTop
      : currentScrollTop;
  const viewportHeight = viewportHeightState() || viewportHeightHint;
  const visibleRange = resolveVirtualRange({
    totalCount: items.length,
    rowHeight,
    scrollTop: effectiveScrollTop,
    viewportHeight,
    overscan,
  });

  entry.visibleRange = visibleRange;

  const semanticHost = asChild && isJsxElement(children) ? children : null;
  const rendersSemanticListItems =
    getListHostElementName(semanticHost) === 'ul' ||
    getListHostElementName(semanticHost) === 'ol';

  const finalProps = mergeProps(rest, {
    ref: entry.rootRef,
    role: rendersSemanticListItems ? undefined : 'list',
    'data-slot': 'virtual-list',
    'data-virtual-list': 'true',
    'data-viewport': viewport,
  });

  const content = (
    <>
      {renderVirtualListRows(
        entry,
        items,
        getKey,
        visibleRange,
        rendersSemanticListItems
      )}
    </>
  );
  commitVirtualListLayoutRules(entry);

  if (asChild) {
    if (!isJsxElement(children)) {
      throw new Error(
        'VirtualList asChild mode requires a single JSX element host'
      );
    }

    return cloneJsxElement(
      children,
      {
        ...(finalProps as Record<string, unknown>),
        'data-virtual-scroll-top': String(currentScrollTop),
        'data-virtual-viewport-height': String(viewportHeight),
        'data-virtual-render-version': String(renderVersion),
        'data-virtual-visible-start-index': String(
          visibleRange.visibleStartIndex
        ),
        'data-virtual-visible-end-index': String(visibleRange.visibleEndIndex),
      },
      content
    );
  }

  return (
    <div
      {...finalProps}
      data-virtual-scroll-top={String(currentScrollTop)}
      data-virtual-viewport-height={String(viewportHeight)}
      data-virtual-render-version={String(renderVersion)}
      data-virtual-visible-start-index={String(visibleRange.visibleStartIndex)}
      data-virtual-visible-end-index={String(visibleRange.visibleEndIndex)}
    >
      {content}
    </div>
  );
}
