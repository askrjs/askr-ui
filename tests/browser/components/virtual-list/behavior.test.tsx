import { state } from '@askrjs/askr';
import { afterEach, describe, expect, it } from 'vite-plus/test';
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

describe('VirtualList - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should renders a virtual window, scrolls by index, and follows the bottom', async () => {
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

  it('should supports asChild composition with semantic list items', async () => {
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
});
