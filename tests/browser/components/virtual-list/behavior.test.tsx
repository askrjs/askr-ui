import { CspNonceScope, state } from '@askrjs/askr';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../src/components/virtual-list';
import { flushUpdates, mount, unmount } from '../../test-utils';

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

describe('VirtualList - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should release generated layout rules after unmount', async () => {
    const nonce = 'dmlydHVhbC1saXN0LW5vbmNl';
    container = mount(
      <CspNonceScope value={nonce}>
        <VirtualList
          aria-label="Messages"
          style={{ height: '74px', overflowY: 'auto' }}
          items={createItems(3)}
          rowHeight={37}
          getKey={(item) => item.id}
          rowComponent={({ item }) => <span>{item.label}</span>}
        />
      </CspNonceScope>
    );
    await flushUpdates();

    const dynamicStyles = () =>
      Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      )
        .map((style) => style.textContent ?? '')
        .join('\n');

    expect(dynamicStyles()).toContain('data-askr-virtual-list-row-height="37"');
    expect(
      Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      ).some(
        (style) =>
          style.nonce === nonce &&
          style.textContent?.includes('data-askr-virtual-list-row-height="37"')
      )
    ).toBe(true);

    unmount(container);
    container = undefined;
    await Promise.resolve();

    expect(dynamicStyles()).not.toContain(
      'data-askr-virtual-list-row-height="37"'
    );
  });

  it('should render a virtual window, scroll by index, and follow the bottom', async () => {
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

    container = mount(<VirtualizedFeed />);
    await flushUpdates();

    expect(
      container
        .querySelector('[data-slot="virtual-list"]')
        ?.getAttribute('role')
    ).toBe('list');
    expect(
      container.querySelectorAll('[data-slot="virtual-list-row"]')
    ).toHaveLength(3);
    expect(container.querySelector('[data-key="item-0"]')).toBeTruthy();
    expect(container.querySelector('[data-key="item-2"]')).toBeTruthy();
    expect(api?.getVisibleRange().visibleStartIndex).toBe(0);

    api?.scrollToIndex(4);
    await flushUpdates();

    expect(api?.getVisibleRange().visibleStartIndex).toBe(4);
    expect(
      container
        .querySelector('[data-key="item-4"]')
        ?.getAttribute('data-visible')
    ).toBe('true');

    api?.scrollToBottom();
    await flushUpdates();

    expect(api?.isFollowingBottom()).toBe(true);
    expect(api?.getScrollTop()).toBe(100);

    appendItem?.();
    await flushUpdates();

    expect(api?.isFollowingBottom()).toBe(true);
    expect(api?.getPendingUnseenCount()).toBe(0);
    expect(api?.getScrollTop()).toBe(120);
    expect(container.querySelector('[data-key="item-8"]')).toBeTruthy();
  });

  it('should map typed viewport affordance to a stable data attribute', async () => {
    container = mount(
      <VirtualList
        aria-label="Messages"
        viewport="lg"
        style={{ height: '60px', overflowY: 'auto' }}
        items={createItems(4)}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <span>{item.label}</span>}
      />
    );
    await flushUpdates();

    expect(
      container
        .querySelector('[data-slot="virtual-list"]')
        ?.getAttribute('data-viewport')
    ).toBe('lg');
  });

  it('should support asChild composition with semantic list items', async () => {
    container = mount(
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
      </VirtualList>
    );
    await flushUpdates();

    const host = container.querySelector('ul');
    const firstRow = container.querySelector('li');

    expect(host?.getAttribute('data-slot')).toBe('virtual-list');
    expect(host?.getAttribute('role')).toBeNull();
    expect(firstRow?.getAttribute('data-slot')).toBe('virtual-list-row');
    expect(firstRow?.getAttribute('role')).toBeNull();
  });

  it('should forward user scroll handlers from the virtual viewport', async () => {
    const onScroll = vi.fn();

    container = mount(
      <VirtualList
        aria-label="Messages"
        style={{ height: '60px', overflowY: 'auto' }}
        items={createItems(10)}
        rowHeight={20}
        overscan={2}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <span>{item.label}</span>}
        onScroll={onScroll}
      />
    );
    await flushUpdates();

    const host = container.querySelector(
      '[data-slot="virtual-list"]'
    ) as HTMLElement | null;

    expect(onScroll).not.toHaveBeenCalled();

    if (host) {
      host.scrollTop = 40;
      host.dispatchEvent(new Event('scroll', { bubbles: true }));
    }
    await flushUpdates();

    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it('should reserve the full native scroll extent and advance from browser scrolling', async () => {
    let api: VirtualListApi<Item> | null = null;

    container = mount(
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
      />
    );
    await flushUpdates();

    const host = container.querySelector(
      '[data-slot="virtual-list"]'
    ) as HTMLElement;

    expect(host.scrollHeight).toBe(200_000);

    host.scrollTop = 20_000;
    host.dispatchEvent(new Event('scroll', { bubbles: true }));
    await flushUpdates();

    expect(host.scrollTop).toBeCloseTo(20_000, 0);
    expect(api?.getVisibleRange().visibleStartIndex).toBe(1_000);
  });

  it('should clamp a pending scroll commit when its dataset is replaced', async () => {
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

    container = mount(<FilterableList />);
    await flushUpdates();

    api?.scrollToIndex(4_000, 'start');
    replaceItems?.();
    await flushUpdates();

    const maximumScrollTop = 20 * 20 - 100;
    expect(api?.getScrollTop()).toBeLessThanOrEqual(maximumScrollTop);

    await nextAnimationFrame();

    expect(api?.getScrollTop()).toBeLessThanOrEqual(maximumScrollTop);
  });

  it('should report no ResizeObserver loop errors during dynamic resize churn', async () => {
    const resizeErrors: string[] = [];
    const onWindowError = (event: ErrorEvent) => {
      if (event.message.includes('ResizeObserver loop')) {
        resizeErrors.push(event.message);
        event.preventDefault();
      }
    };
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation((...values: unknown[]) => {
        const message = values.map(String).join(' ');
        if (message.includes('ResizeObserver loop')) resizeErrors.push(message);
      });
    window.addEventListener('error', onWindowError);

    try {
      container = mount(
        <VirtualList
          aria-label="Resizable messages"
          style={{ height: '100px', overflowY: 'auto' }}
          items={createItems(1_000)}
          rowHeight={20}
          getKey={(item) => item.id}
          rowComponent={({ item }) => <span>{item.label}</span>}
        />
      );
      await flushUpdates();

      const host = container.querySelector(
        '[data-slot="virtual-list"]'
      ) as HTMLElement;
      host.scrollTop = 10_000;
      host.dispatchEvent(new Event('scroll', { bubbles: true }));

      for (const height of [0, 50, 400, 1, 10_000, 0, 300]) {
        host.style.height = `${height}px`;
        await nextAnimationFrame();
      }
      await nextAnimationFrame();

      expect(resizeErrors).toEqual([]);
    } finally {
      window.removeEventListener('error', onWindowError);
      consoleError.mockRestore();
    }
  });

  it('should contain content within its fixed row-height contract', async () => {
    container = mount(
      <VirtualList
        aria-label="Overflowing messages"
        style={{ height: '40px', overflowY: 'auto' }}
        items={createItems(2)}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => (
          <div style={{ height: '200px' }}>{item.label}</div>
        )}
      />
    );
    await flushUpdates();

    const rows = Array.from(
      container.querySelectorAll<HTMLElement>('[data-slot="virtual-list-row"]')
    );
    const firstBox = rows[0].getBoundingClientRect();
    const secondBox = rows[1].getBoundingClientRect();

    expect(getComputedStyle(rows[0]).overflowY).toBe('hidden');
    expect(firstBox.height).toBeCloseTo(20, 0);
    expect(secondBox.top - firstBox.top).toBeCloseTo(20, 0);
  });

  it('should reposition keyed rows when an opt-in row height expands', async () => {
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

    container = mount(<ExpandableList />);
    await flushUpdates();
    const host = container.querySelector(
      '[data-slot="virtual-list"]'
    ) as HTMLElement;
    expect(host.scrollHeight).toBe(80);

    (
      container.querySelector('[data-key="item-0"] button') as HTMLButtonElement
    ).click();
    await flushUpdates();
    const inspect = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Inspect Item 0')
    ) as HTMLButtonElement;
    inspect.focus();
    const first = container.querySelector('[data-key="item-0"]') as HTMLElement;
    const second = container.querySelector(
      '[data-key="item-1"]'
    ) as HTMLElement;
    expect(first.getBoundingClientRect().height).toBeCloseTo(80, 0);
    expect(
      second.getBoundingClientRect().top - first.getBoundingClientRect().top
    ).toBeCloseTo(80, 0);
    expect(host.scrollHeight).toBe(140);
    expect(document.activeElement).toBe(inspect);
  });
});
