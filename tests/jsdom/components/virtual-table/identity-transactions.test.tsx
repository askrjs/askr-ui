import { resolveVirtualRange } from '../../../../src/components/_internal/virtualization';
import { syncVirtualTableRows } from '../../../../src/components/virtual-table/virtualization-orchestration';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { prepareDynamicStyleRule } from '../../../../src/components/_internal/dynamic-style';
import { afterEach, expect, it, vi } from 'vite-plus/test';
import { createIsland } from '@askrjs/askr/boot';
import { flush } from '@askrjs/askr/testing';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../src/components/virtual-list';
import {
  VirtualTable,
  type VirtualTableApi,
} from '../../../../src/components/virtual-table';
import { unmount } from '../../test-utils';
let container: HTMLElement | undefined;
afterEach(() => {
  unmount(container);
  container = undefined;
});
function Rejection(props: { reject: boolean }) {
  if (props.reject) throw Error('discard key resolver');
  return <span />;
}
async function settle() {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
    flush();
  }
}
function setup(kind: 'list' | 'table', connected = true) {
  let rows = ['a', 'b', 'c', 'd', 'e', 'f'];
  let rejected = false;
  let proposed = false;
  let insertSibling = false;
  const nodes: Array<HTMLElement | null> = [];
  const apis: Array<VirtualListApi<string> | VirtualTableApi<string> | null> =
    [];
  let api: VirtualListApi<string> | VirtualTableApi<string> | null = null;
  const oldKey = (row: string) => 'old-' + row;
  const newKey = (row: string) => 'new-' + row;
  const rowComponent = ({ item }: { item: string }) => <span>{item}</span>;
  const columns = [
    {
      id: 'value',
      header: 'Value',
      cellComponent: ({ row }: { row: string }) => <span>{row}</span>,
    },
  ];
  const apiRef = (value: typeof api) => {
    api = value;
    apis.push(value);
  };
  const ref = (node: HTMLElement | null) => nodes.push(node);
  const Root = () => (
    <div>
      {kind === 'list' ? (
        <VirtualList
          items={rows}
          getKey={proposed ? newKey : oldKey}
          rowHeight={28}
          overscan={0}
          rowComponent={rowComponent}
          style={{ height: '56px', overflowY: 'auto' }}
          apiRef={apiRef}
          ref={ref}
        />
      ) : (
        <VirtualTable
          rows={rows}
          getKey={proposed ? newKey : oldKey}
          rowHeight={28}
          headerHeight={28}
          overscan={0}
          columns={columns}
          style={{ height: '56px', overflowY: 'auto' }}
          apiRef={apiRef}
          ref={ref}
        />
      )}
      <div data-testid="insertion-host">
        {insertSibling ? <span>Proposal</span> : null}
      </div>
      <Rejection reject={rejected} />
    </div>
  );
  container = document.createElement('div');
  if (connected) document.body.appendChild(container);
  const root = container;
  createIsland({ root, component: Root });
  return {
    get api() {
      return api!;
    },
    root,
    nodes,
    apis,
    reject(phase: 'render' | 'structural' = 'render') {
      proposed = true;
      rejected = phase === 'render';
      insertSibling = phase === 'structural';
      const host = root.querySelector('[data-testid="insertion-host"]')!;
      const insertion =
        phase === 'structural'
          ? vi.spyOn(host, 'insertBefore').mockImplementation(() => {
              throw Error('discard key resolver');
            })
          : undefined;
      try {
        expect(() => createIsland({ root, component: Root })).toThrow(
          'discard key resolver'
        );
      } finally {
        proposed = false;
        rejected = false;
        insertSibling = false;
        insertion?.mockRestore();
      }
    },
    prepend() {
      proposed = false;
      rejected = false;
      rows = ['z', ...rows];
      createIsland({ root, component: Root });
    },
    rerender() {
      createIsland({ root, component: Root });
    },
    changeKey() {
      proposed = true;
      createIsland({ root, component: Root });
    },
  };
}
for (const phase of ['render', 'structural'] as const) {
  it(`VirtualTable keeps committed key lookup after discarded ${phase} resolver`, async () => {
    const view = setup('table');
    await settle();
    const api = view.api as VirtualTableApi<string>;
    api.selectRowByKey('old-b');
    await settle();
    expect(api.getSelectedRowIndex()).toBe(1);
    view.reject(phase);
    expect(view.root.querySelector('[data-row-key="old-b"]')).not.toBeNull();
    expect(api.getSelectedRowKey()).toBe('old-b');
    expect(api.getSelectedRowIndex()).toBe(1);
  });
  for (const kind of ['list', 'table'] as const) {
    it(`Virtual ${kind} retains committed anchor after discarded ${phase} resolver`, async () => {
      const view = setup(kind);
      await settle();
      view.api.scrollToIndex(2, 'start');
      await settle();
      expect(view.api.getScrollTop()).toBe(56);
      view.reject(phase);
      view.prepend();
      await settle();
      expect(view.api.getScrollTop()).toBe(84);
    });
  }
}
for (const connected of [true, false]) {
  for (const kind of ['list', 'table'] as const) {
    it(`Virtual ${kind} ${connected ? 'connected' : 'detached'} retains unchanged public ref callbacks across successful and discarded identity updates`, async () => {
      const view = setup(kind, connected);
      await settle();
      const api = view.api;
      const node = view.nodes[0];
      view.rerender();
      await settle();
      view.changeKey();
      await settle();
      view.prepend();
      await settle();
      view.reject();
      expect(view.nodes).toEqual([node]);
      expect(view.apis).toEqual([api]);
      unmount(container);
      container = undefined;
      expect(view.nodes).toEqual([node, null]);
      expect(view.apis).toEqual([api, null]);
    });
  }
}

it('VirtualTable keeps an already pending anchor correction across another resolver render', () => {
  const rows = ['a', 'b', '', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const keys = rows;
  const oldKey = (row: string) => row;
  const host = {
    keys,
    keyIndexMap: new Map(keys.map((key, index) => [key, index])),
    rowHeight: 28,
    headerHeight: 28,
    rowsRef: rows,
    getKey: oldKey,
    placements: new Map(),
    scrollTopState: Object.assign(() => 56, { set: () => {} }),
    viewportHeightState: Object.assign(() => 112, { set: () => {} }),
    viewportHeightHint: 112,
    visibleRange: resolveVirtualRange({
      totalCount: rows.length,
      rowHeight: 28,
      scrollTop: 112,
      viewportHeight: 84,
      overscan: 0,
    }),
    pendingScrollTop: 112,
    schedulePendingScrollTop: () => {},
  };
  syncVirtualTableRows(host, rows, (row) => row);
  expect(host.pendingScrollTop).toBe(112);
});

for (const kind of ['list', 'table'] as const) {
  it(`Virtual ${kind} retains committed native scroll callback after rejected structural props`, async () => {
    let proposed = false;
    let insertSibling = false;
    const oldScroll = vi.fn();
    const newScroll = vi.fn();
    const rows = ['a', 'b', 'c'];
    const key = (row: string) => row;
    const Root = () => (
      <div>
        {kind === 'list' ? (
          <VirtualList
            items={rows}
            getKey={key}
            rowHeight={28}
            rowComponent={({ item }) => <span>{item}</span>}
            onScroll={proposed ? newScroll : oldScroll}
          />
        ) : (
          <VirtualTable
            rows={rows}
            getKey={key}
            rowHeight={28}
            headerHeight={28}
            columns={[
              {
                id: 'value',
                header: 'Value',
                cellComponent: ({ row }) => <span>{row}</span>,
              },
            ]}
            onScroll={proposed ? newScroll : oldScroll}
          />
        )}
        <div data-testid="insertion-host">
          {insertSibling ? <span>Proposal</span> : null}
        </div>
      </div>
    );
    container = document.createElement('div');
    document.body.appendChild(container);
    const root = container;
    createIsland({ root, component: Root });
    await settle();
    const viewport = root.querySelector<HTMLElement>(
      `[data-slot="virtual-${kind}"]`
    )!;
    viewport.dispatchEvent(new Event('scroll'));
    expect(oldScroll).toHaveBeenCalledTimes(1);
    proposed = true;
    createIsland({ root, component: Root });
    await settle();
    viewport.dispatchEvent(new Event('scroll'));
    expect(newScroll).toHaveBeenCalledTimes(1);
    proposed = false;
    createIsland({ root, component: Root });
    await settle();
    oldScroll.mockClear();
    newScroll.mockClear();
    proposed = true;
    insertSibling = true;
    const host = root.querySelector('[data-testid="insertion-host"]')!;
    const insertion = vi.spyOn(host, 'insertBefore').mockImplementation(() => {
      throw Error('discard scroll callback');
    });
    try {
      expect(() => createIsland({ root, component: Root })).toThrow(
        'discard scroll callback'
      );
    } finally {
      insertion.mockRestore();
      proposed = false;
      insertSibling = false;
    }
    viewport.dispatchEvent(new Event('scroll'));
    expect(oldScroll).toHaveBeenCalledTimes(1);
    expect(newScroll).not.toHaveBeenCalled();
  });
  it(`Virtual ${kind} publishes changed dataset before replacement API callback runs`, () => {
    let rows = ['a', 'b'];
    let replacement = false;
    const snapshots: Array<number> = [];
    const oldApi = (
      api: VirtualListApi<string> | VirtualTableApi<string> | null
    ) => {
      if (api)
        snapshots.push(
          'getItemCount' in api ? api.getItemCount() : api.getRowCount()
        );
    };
    const nextApi = (
      api: VirtualListApi<string> | VirtualTableApi<string> | null
    ) => {
      if (api)
        snapshots.push(
          'getItemCount' in api ? api.getItemCount() : api.getRowCount()
        );
    };
    const key = (row: string) => row;
    const Root = () =>
      kind === 'list' ? (
        <VirtualList
          items={rows}
          getKey={key}
          rowHeight={28}
          rowComponent={({ item }) => <span>{item}</span>}
          apiRef={replacement ? nextApi : oldApi}
        />
      ) : (
        <VirtualTable
          rows={rows}
          getKey={key}
          rowHeight={28}
          headerHeight={28}
          columns={[
            {
              id: 'value',
              header: 'Value',
              cellComponent: ({ row }) => <span>{row}</span>,
            },
          ]}
          apiRef={replacement ? nextApi : oldApi}
        />
      );
    container = document.createElement('div');
    document.body.appendChild(container);
    const root = container;
    createIsland({ root, component: Root });
    rows = ['z', ...rows];
    replacement = true;
    createIsland({ root, component: Root });
    expect(snapshots).toEqual([2, 3]);
  });
  it(`Virtual ${kind} restores refs after rejected structural replacement`, async () => {
    let replace = false;
    let insertSibling = false;
    const oldNode = { current: null as HTMLElement | null };
    const newNode = { current: null as HTMLElement | null };
    const oldApi = {
      current: null as VirtualListApi<string> | VirtualTableApi<string> | null,
    };
    const newApi = {
      current: null as VirtualListApi<string> | VirtualTableApi<string> | null,
    };
    const oldApiRef = (api: typeof oldApi.current) => {
      oldApi.current = api;
    };
    const newApiRef = (api: typeof newApi.current) => {
      newApi.current = api;
    };
    const rows = ['a', 'b'];
    const key = (row: string) => row;
    const Root = () => (
      <div>
        {kind === 'list' ? (
          <VirtualList
            items={rows}
            getKey={key}
            rowHeight={28}
            rowComponent={({ item }) => <span>{item}</span>}
            ref={replace ? newNode : oldNode}
            apiRef={replace ? newApiRef : oldApiRef}
          />
        ) : (
          <VirtualTable
            rows={rows}
            getKey={key}
            rowHeight={28}
            headerHeight={28}
            columns={[
              {
                id: 'value',
                header: 'Value',
                cellComponent: ({ row }) => <span>{row}</span>,
              },
            ]}
            ref={replace ? newNode : oldNode}
            apiRef={replace ? newApiRef : oldApiRef}
          />
        )}
        <div data-testid="insertion-host">
          {insertSibling ? <span>Proposal</span> : null}
        </div>
      </div>
    );
    container = document.createElement('div');
    document.body.appendChild(container);
    const root = container;
    createIsland({ root, component: Root });
    await settle();
    const node = oldNode.current;
    const api = oldApi.current;
    replace = true;
    insertSibling = true;
    const host = root.querySelector('[data-testid="insertion-host"]')!;
    const insertion = vi.spyOn(host, 'insertBefore').mockImplementation(() => {
      throw Error('discard replacement refs');
    });
    try {
      expect(() => createIsland({ root, component: Root })).toThrow(
        'discard replacement refs'
      );
    } finally {
      insertion.mockRestore();
      replace = false;
      insertSibling = false;
    }
    await settle();
    expect(oldNode.current).toBe(node);
    expect(oldApi.current).toBe(api);
    expect(newNode.current).toBeNull();
    expect(newApi.current).toBeNull();
    replace = true;
    createIsland({ root, component: Root });
    await settle();
    expect(oldNode.current).toBeNull();
    expect(oldApi.current).toBeNull();
    expect(newNode.current).toBe(node);
    expect(newApi.current).toBe(api);
    unmount(container);
    container = undefined;
    expect(newNode.current).toBeNull();
    expect(newApi.current).toBeNull();
  });
}

for (const phase of ['render', 'structural'] as const) {
  for (const kind of ['list', 'table'] as const) {
    it(`Virtual ${kind} retains committed row geometry after rejected ${phase} props`, async () => {
      let proposed = false;
      let rejected = false;
      let insertSibling = false;
      const rows = ['a', 'b', 'c'];
      const key = (row: string) => row;
      let api: VirtualListApi<string> | VirtualTableApi<string> | null = null;
      const apiRef = (value: typeof api) => {
        api = value;
      };
      const Root = () => (
        <div>
          {kind === 'list' ? (
            <VirtualList
              items={rows}
              getKey={key}
              rowHeight={proposed ? 56 : 28}
              rowComponent={({ item }) => <span>{item}</span>}
              apiRef={apiRef}
            />
          ) : (
            <VirtualTable
              rows={rows}
              getKey={key}
              rowHeight={proposed ? 56 : 28}
              headerHeight={28}
              columns={[
                {
                  id: 'value',
                  header: 'Value',
                  cellComponent: ({ row }) => <span>{row}</span>,
                },
              ]}
              apiRef={apiRef}
            />
          )}
          <div data-testid="insertion-host">
            {insertSibling ? <span>Proposal</span> : null}
          </div>
          <Rejection reject={rejected} />
        </div>
      );
      container = document.createElement('div');
      document.body.appendChild(container);
      const root = container;
      createIsland({ root, component: Root });
      await settle();
      expect(api!.getState().totalHeight).toBe(kind === 'list' ? 84 : 112);
      proposed = true;
      rejected = phase === 'render';
      insertSibling = phase === 'structural';
      const host = root.querySelector('[data-testid="insertion-host"]')!;
      const insertion =
        phase === 'structural'
          ? vi.spyOn(host, 'insertBefore').mockImplementation(() => {
              throw Error('discard geometry');
            })
          : undefined;
      try {
        expect(() => createIsland({ root, component: Root })).toThrow(
          phase === 'render' ? 'discard key resolver' : 'discard geometry'
        );
      } finally {
        insertion?.mockRestore();
        proposed = false;
        rejected = false;
        insertSibling = false;
      }
      expect(api!.getState().totalHeight).toBe(kind === 'list' ? 84 : 112);
    });
  }
}
it('VirtualTable retains committed selection callback after rejected structural props', async () => {
  let proposed = false;
  let insertSibling = false;
  const oldSelection = vi.fn();
  const newSelection = vi.fn();
  const rows = ['a', 'b'];
  const key = (row: string) => row;
  let api: VirtualTableApi<string> | null = null;
  const apiRef = (value: typeof api) => {
    api = value;
  };
  const Root = () => (
    <div>
      <VirtualTable
        rows={rows}
        getKey={key}
        rowHeight={28}
        headerHeight={28}
        columns={[
          {
            id: 'value',
            header: 'Value',
            cellComponent: ({ row }) => <span>{row}</span>,
          },
        ]}
        apiRef={apiRef}
        onSelectedRowKeyChange={proposed ? newSelection : oldSelection}
      />
      <div data-testid="insertion-host">
        {insertSibling ? <span>Proposal</span> : null}
      </div>
    </div>
  );
  container = document.createElement('div');
  document.body.appendChild(container);
  const root = container;
  createIsland({ root, component: Root });
  await settle();
  proposed = true;
  insertSibling = true;
  const host = root.querySelector('[data-testid="insertion-host"]')!;
  const insertion = vi.spyOn(host, 'insertBefore').mockImplementation(() => {
    throw Error('discard selection callback');
  });
  try {
    expect(() => createIsland({ root, component: Root })).toThrow(
      'discard selection callback'
    );
  } finally {
    insertion.mockRestore();
    proposed = false;
    insertSibling = false;
  }
  api!.selectRowByKey('b');
  expect(oldSelection).toHaveBeenCalledWith('b');
  expect(newSelection).not.toHaveBeenCalled();
});

for (const kind of ['list', 'table'] as const) {
  it(`Virtual ${kind} retains committed replacement bindings when a caller ref throws`, async () => {
    let replaced = false;
    let throwRef = true;
    const oldNode = { current: null as HTMLElement | null };
    const nextNodes: Array<HTMLElement | null> = [];
    const oldApi = {
      current: null as VirtualListApi<string> | VirtualTableApi<string> | null,
    };
    const newApi = {
      current: null as VirtualListApi<string> | VirtualTableApi<string> | null,
    };
    const oldApiRef = (api: typeof oldApi.current) => {
      oldApi.current = api;
    };
    const newApiRef = (api: typeof newApi.current) => {
      newApi.current = api;
    };
    const nextRef = (node: HTMLElement | null) => {
      nextNodes.push(node);
      if (node && throwRef) throw Error('discard ref callback');
    };
    let rows = ['a', 'b'];
    const key = (row: string) => row;
    const Root = () =>
      kind === 'list' ? (
        <VirtualList
          items={rows}
          getKey={key}
          rowHeight={28}
          rowComponent={({ item }) => <span>{item}</span>}
          ref={replaced ? nextRef : oldNode}
          apiRef={replaced ? newApiRef : oldApiRef}
        />
      ) : (
        <VirtualTable
          rows={rows}
          getKey={key}
          rowHeight={28}
          headerHeight={28}
          columns={[
            {
              id: 'value',
              header: 'Value',
              cellComponent: ({ row }) => <span>{row}</span>,
            },
          ]}
          ref={replaced ? nextRef : oldNode}
          apiRef={replaced ? newApiRef : oldApiRef}
        />
      );
    container = document.createElement('div');
    document.body.appendChild(container);
    const root = container;
    createIsland({ root, component: Root });
    await settle();
    const node = oldNode.current;
    const api = oldApi.current;
    replaced = true;
    rows = ['z', ...rows];
    expect(() => createIsland({ root, component: Root })).toThrow(
      'Composed ref callbacks failed'
    );
    expect(oldNode.current).toBeNull();
    expect(oldApi.current).toBeNull();
    expect(newApi.current).toBe(api);
    expect(node?.isConnected).toBe(true);
    expect(api!.getState().count).toBe(3);
    expect(nextNodes).toEqual([node]);
    throwRef = false;
    createIsland({ root, component: Root });
    await settle();
    expect(oldNode.current).toBeNull();
    expect(oldApi.current).toBeNull();
    expect(newApi.current).toBe(api);
    expect(api!.getState().count).toBe(3);
    unmount(container);
    container = undefined;
    expect(newApi.current).toBeNull();
    expect(nextNodes.at(-1)).toBeNull();
  });
}

for (const movement of ['programmatic', 'user'] as const) {
  it(`VirtualTable ${movement === 'programmatic' ? 'retains pending anchor after a late programmatic' : 'cancels pending anchor after a new user'} scroll event`, async () => {
    let rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const key = (row: string) => row;
    let api: VirtualTableApi<string> | null = null;
    const apiRef = (value: typeof api) => {
      api = value;
    };
    const Root = () => (
      <VirtualTable
        rows={rows}
        getKey={key}
        rowHeight={28}
        headerHeight={28}
        columns={[
          {
            id: 'value',
            header: 'Value',
            cellComponent: ({ row }) => <span>{row}</span>,
          },
        ]}
        apiRef={apiRef}
        style={{ height: '84px', overflowY: 'auto' }}
      />
    );
    container = document.createElement('div');
    document.body.appendChild(container);
    const root = container;
    createIsland({ root, component: Root });
    await settle();
    const viewport = root.querySelector<HTMLElement>(
      '[data-slot="virtual-table"]'
    )!;
    api!.scrollToIndex(2);
    await settle();
    expect(api!.getScrollTop()).toBe(56);
    rows = ['z', ...rows];
    createIsland({ root, component: Root });
    expect(api!.getScrollTop()).toBe(84);
    if (movement === 'user') viewport.scrollTop = 40;
    viewport.dispatchEvent(new Event('scroll'));
    expect(api!.getScrollTop()).toBe(movement === 'programmatic' ? 84 : 40);
  });
}

for (const phase of ['render', 'structural'] as const) {
  for (const kind of ['list', 'table'] as const) {
    it(`Virtual ${kind} does not retain unused dynamic layout rule after rejected ${phase} geometry`, async () => {
      for (const style of document.querySelectorAll(
        'style[data-askr-dynamic-styles]'
      ))
        style.remove();
      let proposed = false;
      let rejected = false;
      let insertSibling = false;
      const rows = ['a', 'b', 'c'];
      const key = (row: string) => row;
      const Root = () => (
        <div>
          {kind === 'list' ? (
            <VirtualList
              items={rows}
              getKey={key}
              rowHeight={proposed ? 731 : 28}
              rowComponent={({ item }) => <span>{item}</span>}
            />
          ) : (
            <VirtualTable
              rows={rows}
              getKey={key}
              rowHeight={proposed ? 731 : 28}
              headerHeight={28}
              columns={[
                {
                  id: 'value',
                  header: 'Value',
                  cellComponent: ({ row }) => <span>{row}</span>,
                },
              ]}
            />
          )}
          <div data-testid="insertion-host">
            {insertSibling ? <span>Proposal</span> : null}
          </div>
          <Rejection reject={rejected} />
        </div>
      );
      container = document.createElement('div');
      document.body.appendChild(container);
      const root = container;
      createIsland({ root, component: Root });
      await settle();
      proposed = true;
      rejected = phase === 'render';
      insertSibling = phase === 'structural';
      const host = root.querySelector('[data-testid="insertion-host"]')!;
      const insertion =
        phase === 'structural'
          ? vi.spyOn(host, 'insertBefore').mockImplementation(() => {
              throw Error('discard dynamic style');
            })
          : undefined;
      try {
        expect(() => createIsland({ root, component: Root })).toThrow(
          phase === 'render' ? 'discard key resolver' : 'discard dynamic style'
        );
      } finally {
        insertion?.mockRestore();
        proposed = false;
        rejected = false;
        insertSibling = false;
      }
      await settle();
      const styles = [
        ...document.querySelectorAll('style[data-askr-dynamic-styles]'),
      ]
        .map((style) => style.textContent)
        .join('\n');
      expect(styles).not.toContain(
        `data-askr-virtual-${kind}-row-height="731"`
      );
    });
  }
}

for (const kind of ['list', 'table'] as const) {
  it(`Virtual ${kind} collects SSR layout rules without mutating an available document`, () => {
    const before = document.head.innerHTML;
    let styles = '';
    const rows = ['a', 'b', 'c'];
    const key = (row: string) => row;
    const Root = () =>
      kind === 'list' ? (
        <VirtualList
          items={rows}
          getKey={key}
          rowHeight={739}
          rowComponent={({ item }) => <span>{item}</span>}
        />
      ) : (
        <VirtualTable
          rows={rows}
          getKey={key}
          rowHeight={739}
          headerHeight={28}
          columns={[
            {
              id: 'value',
              header: 'Value',
              cellComponent: ({ row }) => <span>{row}</span>,
            },
          ]}
        />
      );
    const html = renderToStringSync(
      Root,
      {},
      {
        onContext: (context) => {
          styles = [...context.ssrStyles.values()]
            .map((style) => style.cssText)
            .join('\n');
        },
      }
    );
    expect(html).toContain(`data-askr-virtual-${kind}-row-height="739"`);
    expect(styles).toContain(`data-askr-virtual-${kind}-row-height="739"`);
    expect(document.head.innerHTML).toBe(before);
  });
}
it('prepared dynamic CSS validates synchronously and publishes the captured serialized declarations once', () => {
  const before = document.head.innerHTML;
  expect(() =>
    prepareDynamicStyleRule(
      'invalid-prepared-style',
      '[data-prepared-rule="invalid"]',
      { height: '1px;}' }
    )
  ).toThrow('Unsafe dynamic CSS value');
  expect(document.head.innerHTML).toBe(before);
  let reads = 0;
  let height = '29px';
  const declarations = {
    get height() {
      reads++;
      return height;
    },
  };
  const publish = prepareDynamicStyleRule(
    'prepared-declarations',
    '[data-prepared-rule="captured"]',
    declarations
  );
  expect(reads).toBe(1);
  expect(document.head.innerHTML).toBe(before);
  height = '731px';
  publish();
  expect(reads).toBe(1);
  const styles = [
    ...document.querySelectorAll('style[data-askr-dynamic-styles]'),
  ]
    .map((style) => style.textContent)
    .join('\n');
  expect(styles).toContain('[data-prepared-rule="captured"] { height: 29px; }');
  expect(styles).not.toContain(
    '[data-prepared-rule="captured"] { height: 731px; }'
  );
});
