import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createIsland } from '@askrjs/askr/boot';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../src/components/virtual-list';
import {
  VirtualTable,
  type VirtualTableApi,
} from '../../../../src/components/virtual-table';
import { flushUpdates, mount, unmount } from '../../test-utils';

type Api = VirtualListApi<number> | VirtualTableApi<number>;
type Kind = 'list' | 'table';
function virtualElement(
  kind: Kind,
  ref: Ref<HTMLElement>,
  apiRef: (value: Api | null) => void
) {
  return kind === 'list' ? (
    <VirtualList
      items={[1, 2, 3]}
      rowHeight={28}
      getKey={(item) => item}
      rowComponent={({ item }) => <span>{item}</span>}
      ref={ref}
      apiRef={apiRef}
    />
  ) : (
    <VirtualTable
      rows={[1, 2, 3]}
      rowHeight={28}
      headerHeight={28}
      getKey={(row) => row}
      columns={[
        {
          id: 'value',
          header: 'Value',
          cellComponent: ({ row }) => <span>{row}</span>,
        },
      ]}
      ref={ref}
      apiRef={apiRef}
    />
  );
}
function Rejection(props: { reject: boolean }) {
  if (props.reject) throw new Error('rejected virtual refs');
  return <span>Accepted</span>;
}
let container: HTMLElement | undefined;
afterEach(() => {
  unmount(container);
  container = undefined;
  vi.unstubAllGlobals();
});

const offsetItems = Array.from({ length: 20 }, (_, index) => index);
function offsetProbe(
  kind: Kind,
  apiRef: Ref<Api | null>,
  ref?: Ref<HTMLElement>,
  rowRef?: (node: HTMLElement | null) => void
) {
  const common = {
    ref,
    'data-offset-probe': kind,
    style: { height: '112px', overflow: 'auto' },
    rowHeight: 28,
    getKey: (item: number) => item,
  };
  return kind === 'list' ? (
    <VirtualList
      {...common}
      items={offsetItems}
      apiRef={apiRef as Ref<VirtualListApi<number> | null>}
      rowComponent={({ item }) => <span ref={rowRef}>{item}</span>}
    />
  ) : (
    <VirtualTable
      {...common}
      rows={offsetItems}
      headerHeight={28}
      apiRef={apiRef as Ref<VirtualTableApi<number> | null>}
      columns={[
        {
          id: 'value',
          header: 'Value',
          cellComponent: ({ row }) => <span ref={rowRef}>{row}</span>,
        },
      ]}
    />
  );
}

describe.each(['list', 'table'] as const)(
  'Virtual %s initial offset measurement',
  (kind) => {
    it('should still restore the physical offset before a caller DOM ref observes it', async () => {
      const apiRef = { current: null as Api | null };
      const observed: number[] = [];
      const changeOffset = (node: HTMLElement | null) => {
        const viewport = node?.closest<HTMLElement>(
          `[data-offset-probe="${kind}"]`
        );
        if (viewport) viewport.scrollTop = 56;
      };
      container = mount(
        offsetProbe(
          kind,
          apiRef,
          (node) => {
            if (node) observed.push(node.scrollTop);
          },
          changeOffset
        )
      );
      expect(observed).toEqual([0]);
      await flushUpdates();
      expect(apiRef.current?.getScrollTop()).toBe(0);
    });

    it('should keep a newer API reveal requested before initial viewport setup', async () => {
      const apiRef = { current: null as Api | null };
      container = mount(offsetProbe(kind, apiRef));
      apiRef.current?.scrollToIndex(6);
      expect(apiRef.current?.getScrollTop()).toBe(168);
      await flushUpdates();
      await flushUpdates();
      expect(apiRef.current?.getScrollTop()).toBe(168);
    });

    it('should keep a user scroll delivered after initial viewport setup', async () => {
      const apiRef = { current: null as Api | null };
      container = mount(offsetProbe(kind, apiRef));
      await flushUpdates();
      await flushUpdates();
      const node = container.querySelector<HTMLElement>(
        `[data-offset-probe="${kind}"]`
      );
      if (!node) throw new Error('Missing offset probe viewport');
      node.scrollTop = 84;
      node.dispatchEvent(new Event('scroll'));
      await flushUpdates();
      expect(apiRef.current?.getScrollTop()).toBe(84);
    });
  }
);

describe.each(['list', 'table'] as const)(
  'Virtual %s ref lifecycle',
  (kind) => {
    it('should publish its node and API synchronously when mount returns', () => {
      const nodes: Array<HTMLElement | null> = [];
      const apis: Array<Api | null> = [];
      container = mount(
        virtualElement(
          kind,
          (value) => nodes.push(value),
          (value) => apis.push(value)
        )
      );
      const node = container.querySelector<HTMLElement>(
        `[data-slot="virtual-${kind}"]`
      );
      expect(node).not.toBeNull();
      expect(nodes).toEqual([node]);
      expect(apis).toHaveLength(1);
      expect(apis[0]).not.toBeNull();
    });
    it('should drain replaced callback refs and the current callbacks at teardown', () => {
      const oldNodes: Array<HTMLElement | null> = [];
      const newNodes: Array<HTMLElement | null> = [];
      const oldApis: Array<Api | null> = [];
      const newApis: Array<Api | null> = [];
      const oldRef = (value: HTMLElement | null) => oldNodes.push(value);
      const newRef = (value: HTMLElement | null) => newNodes.push(value);
      const oldApiRef = (value: Api | null) => oldApis.push(value);
      const newApiRef = (value: Api | null) => newApis.push(value);
      let replaced = false;
      const Root = () =>
        virtualElement(
          kind,
          replaced ? newRef : oldRef,
          replaced ? newApiRef : oldApiRef
        );
      container = document.createElement('div');
      document.body.appendChild(container);
      const root = container;
      createIsland({ root, component: Root });
      const node = oldNodes.at(-1);
      const api = oldApis.at(-1);
      replaced = true;
      createIsland({ root, component: Root });
      expect(oldNodes).toEqual([node, null]);
      expect(oldApis).toEqual([api, null]);
      expect(newNodes).toEqual([node]);
      expect(newApis).toEqual([api]);
      unmount(container);
      container = undefined;
      expect(newNodes).toEqual([node, null]);
      expect(newApis).toEqual([api, null]);
      expect(oldNodes).toEqual([node, null]);
      expect(oldApis).toEqual([api, null]);
    });
    it('should discard stale queued observer setup when bindings change immediately after mount', async () => {
      const observers: Array<{
        observe: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
      }> = [];
      class TestResizeObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        constructor() {
          observers.push(this);
        }
      }
      vi.stubGlobal('ResizeObserver', TestResizeObserver);
      const oldNodes: Array<HTMLElement | null> = [];
      const newNodes: Array<HTMLElement | null> = [];
      const oldApis: Array<Api | null> = [];
      const newApis: Array<Api | null> = [];
      const oldRef = (value: HTMLElement | null) => oldNodes.push(value);
      const newRef = (value: HTMLElement | null) => newNodes.push(value);
      const oldApiRef = (value: Api | null) => oldApis.push(value);
      const newApiRef = (value: Api | null) => newApis.push(value);
      let replaced = false;
      const Root = () =>
        virtualElement(
          kind,
          replaced ? newRef : oldRef,
          replaced ? newApiRef : oldApiRef
        );
      container = document.createElement('div');
      document.body.appendChild(container);
      const root = container;
      createIsland({ root, component: Root });
      const node = oldNodes[0];
      const api = oldApis[0];
      expect(observers).toHaveLength(0);
      replaced = true;
      createIsland({ root, component: Root });
      expect(oldNodes).toEqual([node, null]);
      expect(oldApis).toEqual([api, null]);
      expect(newNodes).toEqual([node]);
      expect(newApis).toEqual([api]);
      await flushUpdates();
      const observedNodes = observers.flatMap((observer) =>
        observer.observe.mock.calls.map(([value]) => value)
      );
      unmount(container);
      container = undefined;
      await flushUpdates();
      expect({
        constructed: observers.length,
        observedNodes,
        disconnectCounts: observers.map(
          (observer) => observer.disconnect.mock.calls.length
        ),
      }).toEqual({
        constructed: 1,
        observedNodes: [node],
        disconnectCounts: [1],
      });
      expect(newNodes).toEqual([node, null]);
      expect(newApis).toEqual([api, null]);
    });
    it('should leave committed refs untouched when replacement rendering is rejected', () => {
      const oldNode = { current: null as HTMLElement | null };
      const nextNode = { current: null as HTMLElement | null };
      const oldApi = { current: null as Api | null };
      const nextApi = { current: null as Api | null };
      const oldApiCallback = (value: Api | null) => {
        oldApi.current = value;
      };
      const nextApiCallback = (value: Api | null) => {
        nextApi.current = value;
      };
      let replaced = false;
      let rejected = false;
      const Root = () => (
        <div>
          {virtualElement(
            kind,
            replaced ? nextNode : oldNode,
            replaced ? nextApiCallback : oldApiCallback
          )}
          <Rejection reject={rejected} />
        </div>
      );
      container = document.createElement('div');
      document.body.appendChild(container);
      const root = container;
      createIsland({ root, component: Root });
      const node = oldNode.current;
      const api = oldApi.current;
      replaced = true;
      rejected = true;
      expect(() => createIsland({ root, component: Root })).toThrow(
        'rejected virtual refs'
      );
      expect(oldNode.current).toBe(node);
      expect(oldApi.current).toBe(api);
      expect(nextNode.current).toBeNull();
      expect(nextApi.current).toBeNull();
      expect(node?.isConnected).toBe(true);
      rejected = false;
      createIsland({ root, component: Root });
      expect(oldNode.current).toBeNull();
      expect(oldApi.current).toBeNull();
      expect(nextNode.current).toBe(node);
      expect(nextApi.current).toBe(api);
    });
  }
);
