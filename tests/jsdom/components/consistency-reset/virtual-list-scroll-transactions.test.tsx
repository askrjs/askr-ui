import { afterEach, expect, it, vi } from 'vite-plus/test';
import { createIsland } from '@askrjs/askr/boot';
import { flush } from '@askrjs/askr/testing';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../src/components/virtual-list';
import { unmount } from '../../test-utils';
let container: HTMLElement | undefined;
async function settle() {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    flush();
  }
}
afterEach(async () => {
  unmount(container);
  container = undefined;
  await settle();
  vi.restoreAllMocks();
});

it('should treat a later user scroll to a failed write target as user intent', async () => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
    (callback) => {
      callbacks.set(++nextFrame, callback);
      return nextFrame;
    }
  );
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });
  let items = Array.from({ length: 10 }, (_, i) => String(i));
  const getKey = (item: string) => item;
  const apiRef = { current: null as VirtualListApi<string> | null };
  const Row = ({ item }: { item: string }) => <span>{item}</span>;
  const Root = () => (
    <VirtualList
      items={items}
      getKey={getKey}
      rowHeight={28}
      rowComponent={Row}
      apiRef={apiRef}
      style={{ height: '84px' }}
    />
  );
  container = document.createElement('div');
  document.body.append(container);
  const root = container;
  createIsland({ root, component: Root });
  await settle();
  const viewport = root.querySelector<HTMLElement>(
    '[data-slot="virtual-list"]'
  )!;
  Object.defineProperty(viewport, 'clientHeight', {
    configurable: true,
    value: 84,
  });
  Object.defineProperty(viewport, 'scrollHeight', {
    configurable: true,
    value: 1000,
  });
  let scrollTop = 0;
  let clamp = true;
  Object.defineProperty(viewport, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = clamp ? 0 : value;
    },
  });
  apiRef.current!.scrollToIndex(2);
  await settle();
  const pending = [...callbacks.entries()];
  callbacks.clear();
  for (const [, callback] of pending) callback(0);
  await settle();
  clamp = false;
  items = ['prepended', ...items];
  createIsland({ root, component: Root });
  expect(apiRef.current!.getScrollTop()).toBe(28);
  viewport.scrollTop = 56;
  viewport.dispatchEvent(new Event('scroll'));
  expect(apiRef.current!.getScrollTop()).toBe(56);
});

it('should preserve a user scroll delivered by a child ref between render and parent commit', async () => {
  let items = Array.from({ length: 10 }, (_, i) => String(i));
  const getKey = (item: string) => item;
  const apiRef = { current: null as VirtualListApi<string> | null };
  let interrupt = false;
  const Row = ({ item }: { item: string }) => (
    <span
      ref={(node) => {
        if (node && interrupt) {
          interrupt = false;
          const viewport = container!.querySelector<HTMLElement>(
            '[data-slot="virtual-list"]'
          )!;
          viewport.scrollTop = 0;
          viewport.dispatchEvent(new Event('scroll'));
        }
      }}
    >
      {item}
    </span>
  );
  const Root = () => (
    <VirtualList
      items={items}
      getKey={getKey}
      rowHeight={28}
      rowComponent={Row}
      apiRef={apiRef}
      followBottom
      style={{ height: '84px' }}
    />
  );
  container = document.createElement('div');
  document.body.append(container);
  const root = container;
  createIsland({ root, component: Root });
  await settle();
  const viewport = root.querySelector<HTMLElement>(
    '[data-slot="virtual-list"]'
  )!;
  Object.defineProperty(viewport, 'clientHeight', {
    configurable: true,
    value: 84,
  });
  Object.defineProperty(viewport, 'scrollHeight', {
    configurable: true,
    value: 1000,
  });
  viewport.scrollTop = 196;
  viewport.dispatchEvent(new Event('scroll'));
  await settle();
  expect(apiRef.current!.isFollowingBottom()).toBe(true);
  interrupt = true;
  items = [...items, 'appended'];
  createIsland({ root, component: Root });
  expect(interrupt).toBe(false);
  expect(apiRef.current!.getScrollTop()).toBe(0);
  expect(apiRef.current!.isFollowingBottom()).toBe(false);
});

it.each(['programmatic', 'user'] as const)(
  'should distinguish a late %s scroll while a new list anchor is pending',
  async (movement) => {
    let items = Array.from({ length: 10 }, (_, i) => String(i));
    const getKey = (item: string) => item;
    const apiRef = { current: null as VirtualListApi<string> | null };
    const Row = ({ item }: { item: string }) => <span>{item}</span>;
    const Root = () => (
      <VirtualList
        items={items}
        getKey={getKey}
        rowHeight={28}
        rowComponent={Row}
        apiRef={apiRef}
        style={{ height: '84px' }}
      />
    );
    container = document.createElement('div');
    document.body.append(container);
    const root = container;
    createIsland({ root, component: Root });
    await settle();
    const viewport = root.querySelector<HTMLElement>(
      '[data-slot="virtual-list"]'
    )!;
    apiRef.current!.scrollToIndex(2);
    await settle();
    expect(apiRef.current!.getScrollTop()).toBe(56);
    items = ['prepended', ...items];
    createIsland({ root, component: Root });
    expect(apiRef.current!.getScrollTop()).toBe(84);
    if (movement === 'user') viewport.scrollTop = 40;
    viewport.dispatchEvent(new Event('scroll'));
    expect(apiRef.current!.getScrollTop()).toBe(
      movement === 'programmatic' ? 84 : 40
    );
  }
);
