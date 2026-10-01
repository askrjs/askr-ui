import { CspNonceScope, state } from '@askrjs/askr';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../../src/components/virtual-list';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

type Item = {
  id: string;
  label: string;
};

function createItems(count: number): Item[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    label: `Item ${index}`,
  }));
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function dynamicStyleElements(): HTMLStyleElement[] {
  return Array.from(
    document.querySelectorAll<HTMLStyleElement>(
      'style[data-askr-dynamic-styles]'
    )
  );
}

const NONCE = 'dmlydHVhbC1saXN0LW5vbmNl';

export async function layoutRulesRelease(root: HTMLElement) {
  let container: HTMLElement | undefined = mount(
    <CspNonceScope value={NONCE}>
      <VirtualList
        aria-label="Messages"
        style={{ height: '74px', overflowY: 'auto' }}
        items={createItems(3)}
        rowHeight={37}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <span>{item.label}</span>}
      />
    </CspNonceScope>,
    root
  );
  await flushUpdates();

  return {
    dynamicStyles: () =>
      dynamicStyleElements()
        .map((style) => style.textContent ?? '')
        .join('\n'),
    hasNoncedRowHeightRule: () =>
      dynamicStyleElements().some(
        (style) =>
          style.nonce === NONCE &&
          style.textContent?.includes('data-askr-virtual-list-row-height="37"')
      ),
    /** Unmounts and waits one microtask, as the original test did. */
    unmount: async () => {
      unmount(container);
      container = undefined;
      await Promise.resolve();
    },
  };
}

export async function windowScrollAndFollow(root: HTMLElement) {
  let api: VirtualListApi<Item> | null = null;
  let appendItem: (() => void) | undefined;

  const VirtualizedFeed = () => {
    const itemsState = state(createItems(8));

    appendItem = () => {
      const nextIndex = itemsState().length;

      itemsState.set([
        ...itemsState(),
        { id: `item-${nextIndex}`, label: `Item ${nextIndex}` },
      ]);
    };

    return (
      <VirtualList
        aria-label="Messages"
        style={{ height: '60px', overflowY: 'auto' }}
        items={itemsState()}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <span>{item.label}</span>}
        followBottom
        apiRef={(next) => {
          api = next;
        }}
      />
    );
  };

  mount(<VirtualizedFeed />, root);
  await flushUpdates();

  return {
    visibleStartIndex: () => api?.getVisibleRange().visibleStartIndex ?? null,
    scrollToIndex: async (index: number) => {
      api?.scrollToIndex(index);
      await flushUpdates();
    },
    scrollToBottom: async () => {
      api?.scrollToBottom();
      await flushUpdates();
    },
    appendItem: async () => {
      appendItem?.();
      await flushUpdates();
    },
    isFollowingBottom: () => api?.isFollowingBottom() ?? null,
    scrollTop: () => api?.getScrollTop() ?? null,
    pendingUnseenCount: () => api?.getPendingUnseenCount() ?? null,
  };
}

export async function viewportAffordance(root: HTMLElement): Promise<void> {
  mount(
    <VirtualList
      aria-label="Messages"
      viewport="lg"
      style={{ height: '60px', overflowY: 'auto' }}
      items={createItems(4)}
      rowHeight={20}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <span>{item.label}</span>}
    />,
    root
  );
  await flushUpdates();
}

export async function asChildList(root: HTMLElement): Promise<void> {
  mount(
    <VirtualList
      asChild
      aria-label="Messages"
      style={{ height: '60px', overflowY: 'auto' }}
      items={createItems(3)}
      rowHeight={20}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <span>{item.label}</span>}
    >
      <ul />
    </VirtualList>,
    root
  );
  await flushUpdates();
}

export async function forwardedScrollHandler(root: HTMLElement) {
  const onScroll = spy();

  const container = mount(
    <VirtualList
      aria-label="Messages"
      style={{ height: '60px', overflowY: 'auto' }}
      items={createItems(10)}
      rowHeight={20}
      overscan={2}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <span>{item.label}</span>}
      onScroll={onScroll}
    />,
    root
  );
  await flushUpdates();
  const host = container.querySelector(
    '[data-slot="virtual-list"]'
  ) as HTMLElement;

  return {
    scrollCount: () => onScroll.count(),
    /** Assigning scrollTop makes the browser fire one real scroll event. */
    scrollTo: (top: number) => {
      host.scrollTop = top;
    },
    nextFrame: () => nextAnimationFrame(),
  };
}

export async function nativeScrollExtent(root: HTMLElement) {
  let api: VirtualListApi<Item> | null = null;

  const container = mount(
    <VirtualList
      aria-label="Large messages"
      style={{ height: '200px', overflowY: 'auto' }}
      items={createItems(10_000)}
      rowHeight={20}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <span>{item.label}</span>}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  await flushUpdates();

  const host = container.querySelector(
    '[data-slot="virtual-list"]'
  ) as HTMLElement;

  return {
    /** Assigning scrollTop makes the browser fire a real scroll event. */
    scrollTo: (top: number) => {
      host.scrollTop = top;
    },
    visibleStartIndex: () => api?.getVisibleRange().visibleStartIndex ?? null,
  };
}

export async function clampPendingScrollCommit(root: HTMLElement) {
  let api: VirtualListApi<Item> | null = null;
  let replaceItems: (() => void) | undefined;

  const FilterableList = () => {
    const itemsState = state(createItems(5_000));
    replaceItems = () => {
      itemsState.set(
        Array.from({ length: 20 }, (_, index) => ({
          id: `filtered-item-${index}`,
          label: `Filtered ${index}`,
        }))
      );
    };

    return (
      <VirtualList
        aria-label="Filterable messages"
        style={{ height: '100px', overflowY: 'auto' }}
        items={itemsState()}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <span>{item.label}</span>}
        apiRef={(next) => {
          api = next;
        }}
      />
    );
  };

  mount(<FilterableList />, root);
  await flushUpdates();

  return {
    /**
     * Requests a far scroll and replaces the dataset in the same task, so the
     * scroll commit is still pending when the shorter dataset renders. Returns
     * the scroll offset after the flush and again after the next frame.
     */
    scrollThenReplace: async () => {
      api?.scrollToIndex(4_000, 'start');
      replaceItems?.();
      await flushUpdates();
      const afterFlush = api?.getScrollTop() ?? null;

      await nextAnimationFrame();
      const afterFrame = api?.getScrollTop() ?? null;

      return { afterFlush, afterFrame };
    },
  };
}

export async function resizeChurn(root: HTMLElement) {
  const container = mount(
    <VirtualList
      aria-label="Resizable messages"
      style={{ height: '100px', overflowY: 'auto' }}
      items={createItems(1_000)}
      rowHeight={20}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <span>{item.label}</span>}
    />,
    root
  );
  await flushUpdates();
  const host = container.querySelector(
    '[data-slot="virtual-list"]'
  ) as HTMLElement;

  return {
    /**
     * Scrolls deep, then resizes the viewport once per frame, collecting any
     * ResizeObserver loop error reported through `window.onerror` or
     * `console.error` (both are swallowed so they reach only this report).
     */
    churn: async () => {
      const resizeErrors: string[] = [];
      const onWindowError = (event: ErrorEvent) => {
        if (event.message.includes('ResizeObserver loop')) {
          resizeErrors.push(event.message);
          event.preventDefault();
        }
      };
      const originalConsoleError = console.error;
      console.error = (...values: unknown[]) => {
        const message = values.map(String).join(' ');
        if (message.includes('ResizeObserver loop')) resizeErrors.push(message);
        else originalConsoleError(...values);
      };
      window.addEventListener('error', onWindowError);

      try {
        host.scrollTop = 10_000;
        host.dispatchEvent(new Event('scroll', { bubbles: true }));

        for (const height of [0, 50, 400, 1, 10_000, 0, 300]) {
          host.style.height = `${height}px`;
          await nextAnimationFrame();
        }
        await nextAnimationFrame();

        return resizeErrors;
      } finally {
        window.removeEventListener('error', onWindowError);
        console.error = originalConsoleError;
      }
    },
  };
}

export async function fixedRowHeightContainment(
  root: HTMLElement
): Promise<void> {
  mount(
    <VirtualList
      aria-label="Overflowing messages"
      style={{ height: '40px', overflowY: 'auto' }}
      items={createItems(2)}
      rowHeight={20}
      getKey={(item) => item.id}
      rowComponent={({ item }) => (
        <div style={{ height: '200px' }}>{item.label}</div>
      )}
    />,
    root
  );
  await flushUpdates();
}

export async function expandableRowHeight(root: HTMLElement): Promise<void> {
  function ExpandableList() {
    const expanded = state<string | null>(null);
    const items = createItems(4);
    return (
      <VirtualList
        aria-label="Expandable incidents"
        style={{ height: '40px', overflowY: 'auto' }}
        items={items}
        rowHeight={20}
        overscan={1}
        getRowHeight={(item) => (expanded() === item.id ? 80 : 20)}
        getKey={(item) => item.id}
        rowComponent={({ item }) => (
          <div>
            <button onClick={() => expanded.set(item.id)}>
              Expand {item.label}
            </button>
            {expanded() === item.id ? (
              <button>Inspect {item.label}</button>
            ) : null}
          </div>
        )}
      />
    );
  }

  mount(<ExpandableList />, root);
  await flushUpdates();
}
