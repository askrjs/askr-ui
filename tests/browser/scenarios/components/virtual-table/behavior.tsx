import { createIsland } from '@askrjs/askr/boot';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../../src/components/virtual-list';
import { CspNonceScope, state } from '@askrjs/askr';
import {
  VirtualTable,
  type VirtualTableApi,
  type VirtualTableColumn,
} from '../../../../../src/components/virtual-table';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

type Row = {
  id: string;
  name: string;
  email: string;
};

function createRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    name: `User ${index}`,
    email: `user-${index}@example.com`,
  }));
}

const columns: readonly VirtualTableColumn<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    cellComponent: ({ row }) => <span>{row.name}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    cellComponent: ({ row }) => <span>{row.email}</span>,
  },
];

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Records whether the last event of `type` to reach `container` (bubble phase,
 * after every handler inside the table) had its default prevented, so a spec
 * driving real input can still read `defaultPrevented`.
 */
function recordDefaultPrevented(container: HTMLElement, type: string) {
  let prevented: boolean | null = null;
  container.addEventListener(type, (event) => {
    prevented = event.defaultPrevented;
  });
  return () => prevented;
}

function dynamicStyles(): string {
  return Array.from(
    document.querySelectorAll<HTMLStyleElement>(
      'style[data-askr-dynamic-styles]'
    )
  )
    .map((style) => style.textContent ?? '')
    .join('\n');
}

export async function layoutRuleRelease(root: HTMLElement) {
  const nonce = 'dmlydHVhbC10YWJsZS1ub25jZQ';
  let container: HTMLElement | undefined = mount(
    <CspNonceScope value={nonce}>
      <VirtualTable
        aria-label="Users"
        style={{ height: '129px', overflowY: 'auto' }}
        rows={createRows(3)}
        rowHeight={43}
        headerHeight={43}
        getKey={(row) => row.id}
        columns={[
          {
            ...columns[0],
            width: 173,
          },
        ]}
      />
    </CspNonceScope>,
    root
  );
  await flushUpdates();

  return {
    mounted: () => ({
      styles: dynamicStyles(),
      headerCellHeight: container
        ?.querySelector('[data-slot="virtual-table-header-cell"]')
        ?.getBoundingClientRect().height,
      hasNoncedRule: Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      ).some(
        (style) =>
          style.nonce === nonce &&
          style.textContent?.includes('data-askr-virtual-table-row-height="43"')
      ),
    }),
    unmounted: async () => {
      unmount(container);
      container = undefined;
      await Promise.resolve();
      return { styles: dynamicStyles() };
    },
  };
}

export async function stickyHeaderSelection(root: HTMLElement) {
  const onRowClick = spy();
  let api: VirtualTableApi<Row> | null = null;

  const container = mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(10)}
      rowHeight={24}
      headerHeight={24}
      overscan={0}
      getKey={(row) => row.id}
      columns={columns}
      onRowClick={onRowClick}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  await flushUpdates();

  const wrapper = container.querySelector(
    '[data-slot="virtual-table"]'
  ) as HTMLElement;

  return {
    /** Assigning scrollTop makes the browser fire a real scroll event. */
    scrollTo: (top: number) => {
      wrapper.scrollTop = top;
    },
    rowClickCount: () => onRowClick.count(),
    selectedRowKey: () => api?.getSelectedRowKey() ?? null,
    selectedRowIndex: () => api?.getSelectedRowIndex() ?? null,
    scrollToBottom: async () => {
      api?.scrollToBottom();
      await flushUpdates();
    },
    isAtBottom: () => api?.isAtBottom() ?? null,
  };
}

export async function nestedInteractiveCell(
  root: HTMLElement,
  options?: { defaultOverscan?: boolean }
) {
  let api: VirtualTableApi<Row> | null = null;
  const onCellAction = spy<[string]>();

  const container = mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(4)}
      rowHeight={40}
      headerHeight={40}
      overscan={options?.defaultOverscan ? undefined : 4}
      getKey={(row) => row.id}
      columns={[
        ...columns,
        {
          id: 'actions',
          header: 'Actions',
          cellComponent: ({ row }) => (
            <button type="button" onClick={() => onCellAction(row.id)}>
              Open {row.id}
            </button>
          ),
        },
      ]}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  await flushUpdates();

  const originalAction = container.querySelector(
    '[data-row-key="row-0"] button'
  ) as HTMLButtonElement;

  return {
    actionArgs: () => onCellAction.calls.map(([id]) => id),
    selectedRowKey: () => api?.getSelectedRowKey() ?? null,
    legacyClick: async () => {
      originalAction.click();
      await flushUpdates();
    },
    legacyKeyDown: async () => {
      originalAction.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );
      await flushUpdates();
    },
  };
}

export async function defaultPreventedNestedEvents(root: HTMLElement) {
  let api: VirtualTableApi<Row> | null = null;

  const container = mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(4)}
      rowHeight={40}
      headerHeight={40}
      getKey={(row) => row.id}
      columns={[
        {
          id: 'name',
          header: 'Name',
          cellComponent: ({ row }) => (
            <span
              data-prevent-table-event="true"
              onClick={(event: MouseEvent) => event.preventDefault()}
              onKeyDown={(event: KeyboardEvent) => event.preventDefault()}
            >
              {row.name}
            </span>
          ),
        },
      ]}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  await flushUpdates();

  const target = container.querySelector(
    '[data-row-key="row-0"] [data-prevent-table-event]'
  ) as HTMLElement;

  return {
    click: async () => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(clickEvent);
      await flushUpdates();
      return {
        defaultPrevented: clickEvent.defaultPrevented,
        selectedRowKey: api?.getSelectedRowKey() ?? null,
      };
    },
    arrowDown: async () => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(keyEvent);
      await flushUpdates();
      return {
        defaultPrevented: keyEvent.defaultPrevented,
        selectedRowKey: api?.getSelectedRowKey() ?? null,
      };
    },
  };
}

export async function callerPreventedKeyboard(root: HTMLElement) {
  let api: VirtualTableApi<Row> | null = null;
  const onKeyDown = spy<[KeyboardEvent]>((event: KeyboardEvent) => {
    event.preventDefault();
  });

  const container = mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(4)}
      rowHeight={40}
      headerHeight={40}
      getKey={(row) => row.id}
      columns={columns}
      onKeyDown={onKeyDown}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  await flushUpdates();
  const keydownPrevented = recordDefaultPrevented(container, 'keydown');

  return {
    keyDownCount: () => onKeyDown.count(),
    keydownPrevented,
    selectedRowKey: () => api?.getSelectedRowKey() ?? null,
    flush: async () => {
      await flushUpdates();
    },
  };
}

export async function viewportAffordances(root: HTMLElement): Promise<void> {
  mount(
    <VirtualTable
      aria-label="Users"
      viewport="lg"
      tableWidth="compact"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(4)}
      rowHeight={24}
      headerHeight={24}
      getKey={(row) => row.id}
      columns={columns}
    />,
    root
  );
  await flushUpdates();
}

export async function emptyScrollEdges(root: HTMLElement): Promise<void> {
  mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={[]}
      rowHeight={24}
      headerHeight={24}
      getKey={(row: Row) => row.id}
      columns={columns}
    />,
    root
  );
  await flushUpdates();
}

export async function asChildComposition(root: HTMLElement): Promise<void> {
  mount(
    <VirtualTable
      asChild
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(4)}
      rowHeight={24}
      headerHeight={24}
      getKey={(row) => row.id}
      columns={columns}
    >
      <section />
    </VirtualTable>,
    root
  );
  await flushUpdates();
}

export async function forwardedScrollHandler(root: HTMLElement) {
  const onScroll = spy();
  let api: VirtualTableApi<Row> | null = null;

  const container = mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(10)}
      rowHeight={24}
      headerHeight={24}
      overscan={0}
      getKey={(row) => row.id}
      columns={columns}
      onScroll={onScroll}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  await flushUpdates();

  const wrapper = container.querySelector(
    '[data-slot="virtual-table"]'
  ) as HTMLElement;

  return {
    scrollCount: () => onScroll.count(),
    /** Assigning scrollTop makes the browser fire one real scroll event. */
    scrollTo: (top: number) => {
      wrapper.scrollTop = top;
    },
    scrollTop: () => api?.getScrollTop() ?? null,
    nextFrame: () => nextAnimationFrame(),
  };
}

export async function clampedPendingScrollCommit(root: HTMLElement) {
  let api: VirtualTableApi<Row> | null = null;
  let replaceRows: (() => void) | undefined;

  const FilterableTable = () => {
    const rowsState = state(createRows(5_000));
    replaceRows = () => {
      rowsState.set(
        Array.from({ length: 20 }, (_, index) => ({
          id: `filtered-row-${index}`,
          name: `Filtered ${index}`,
          email: `filtered-${index}@example.com`,
        }))
      );
    };

    return (
      <VirtualTable
        aria-label="Filterable users"
        style={{ height: '120px', overflowY: 'auto' }}
        rows={rowsState()}
        rowHeight={24}
        headerHeight={24}
        getKey={(row) => row.id}
        columns={columns}
        apiRef={(next) => {
          api = next;
        }}
      />
    );
  };

  const container = mount(<FilterableTable />, root);
  await flushUpdates();

  (api as VirtualTableApi<Row> | null)?.scrollToIndex(4_000, 'start');
  replaceRows?.();
  await flushUpdates();
  await flushUpdates();

  const wrapper = container.querySelector(
    '[data-slot="virtual-table"]'
  ) as HTMLElement;

  return {
    afterReplace: () => ({
      rowCount: api?.getRowCount(),
      scrollTop: api?.getScrollTop(),
    }),
    afterFrame: async () => {
      await nextAnimationFrame();
      return {
        scrollTop: api?.getScrollTop(),
        wrapperScrollTop: wrapper.scrollTop,
      };
    },
  };
}

export async function resizeChurn(root: HTMLElement) {
  const container = mount(
    <VirtualTable
      aria-label="Resizable users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(1_000)}
      rowHeight={24}
      headerHeight={24}
      getKey={(row) => row.id}
      columns={columns}
    />,
    root
  );
  await flushUpdates();
  const wrapper = container.querySelector(
    '[data-slot="virtual-table"]'
  ) as HTMLElement;

  return {
    /**
     * Scrolls deep, then resizes the wrapper once per frame, collecting any
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
        wrapper.scrollTop = 10_000;
        wrapper.dispatchEvent(new Event('scroll', { bubbles: true }));

        for (const height of [0, 50, 400, 1, 10_000, 0, 300]) {
          wrapper.style.height = `${height}px`;
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

export async function fixedRowHeightContract(root: HTMLElement) {
  const overflowColumns: readonly VirtualTableColumn<Row>[] = [
    {
      id: 'name',
      header: 'Name',
      cellComponent: ({ row }) => (
        <div style={{ height: '200px' }}>{row.name}</div>
      ),
    },
  ];

  const container = mount(
    <VirtualTable
      aria-label="Overflowing users"
      style={{ height: '72px', overflowY: 'auto' }}
      rows={createRows(2)}
      rowHeight={24}
      headerHeight={24}
      getKey={(row) => row.id}
      columns={overflowColumns}
    />,
    root
  );
  await flushUpdates();

  return {
    measurements: () => {
      const rows = Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-slot="virtual-table-row"]'
        )
      );
      const firstCell = rows[0].querySelector<HTMLElement>(
        '[data-slot="virtual-table-cell"]'
      );
      const firstCellContent = rows[0].querySelector<HTMLElement>(
        '[data-slot="virtual-table-cell-content"]'
      );
      const firstBox = rows[0].getBoundingClientRect();
      const secondBox = rows[1].getBoundingClientRect();

      return {
        cellOverflowY: firstCell && getComputedStyle(firstCell).overflowY,
        cellContentOverflowY:
          firstCellContent && getComputedStyle(firstCellContent).overflowY,
        firstRowHeight: firstBox.height,
        rowOffset: secondBox.top - firstBox.top,
      };
    },
  };
}

export function falsyTableRows(root: HTMLElement) {
  let api: VirtualTableApi<unknown> | null = null;
  mount(
    <VirtualTable
      style={{ height: '180px', overflowY: 'auto' }}
      aria-label="Falsy rows"
      rows={[0, false, '', null, undefined, { name: 'object' }]}
      rowHeight={28}
      headerHeight={28}
      getKey={(_, index) => String(index)}
      columns={[
        {
          id: 'value',
          header: 'Value',
          cellComponent: ({ row }) => <span>{String(row)}</span>,
        },
      ]}
      apiRef={(next) => {
        api = next;
      }}
    />,
    root
  );
  return {
    select: async (index: number) => {
      api?.selectRowByIndex(index);
      await flushUpdates();
      return {
        key: api?.getSelectedRowKey(),
        index: api?.getSelectedRowIndex(),
      };
    },
    selectKey: async (key: string) => {
      api?.selectRowByKey(key);
      await flushUpdates();
      return {
        key: api?.getSelectedRowKey(),
        index: api?.getSelectedRowIndex(),
      };
    },
  };
}

export function virtualRefReplacement(root: HTMLElement) {
  const oldListRef = { current: null as HTMLElement | null };
  const newListRef = { current: null as HTMLElement | null };
  const oldListApi = { current: null as VirtualListApi<number> | null };
  const newListApi = { current: null as VirtualListApi<number> | null };
  const oldTableRef = { current: null as HTMLElement | null };
  const newTableRef = { current: null as HTMLElement | null };
  const oldTableApi = { current: null as VirtualTableApi<number> | null };
  const newTableApi = { current: null as VirtualTableApi<number> | null };
  let change!: () => void;
  function Fixture() {
    const replaced = state(false);
    change = () => replaced.set(true);
    const next = replaced();
    return (
      <>
        <VirtualList
          aria-label="List"
          style={{ height: '84px' }}
          items={[1, 2, 3]}
          rowHeight={28}
          getKey={(item) => item}
          rowComponent={({ item }) => <span>{item}</span>}
          ref={next ? newListRef : oldListRef}
          apiRef={next ? newListApi : oldListApi}
        />
        <VirtualTable
          aria-label="Table"
          style={{ height: '112px' }}
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
          ref={next ? newTableRef : oldTableRef}
          apiRef={next ? newTableApi : oldTableApi}
        />
      </>
    );
  }
  const container = mount(<Fixture />, root);
  return {
    change: async () => {
      change();
      await flushUpdates();
    },
    unmount: async () => {
      unmount(container);
      await flushUpdates();
    },
    refs: () => ({
      oldListNode: oldListRef.current !== null,
      newListNode: newListRef.current !== null,
      oldListApi: oldListApi.current !== null,
      newListApi: newListApi.current !== null,
      oldTableNode: oldTableRef.current !== null,
      newTableNode: newTableRef.current !== null,
      oldTableApi: oldTableApi.current !== null,
      newTableApi: newTableApi.current !== null,
    }),
  };
}

export function emptyKeyAnchoring(root: HTMLElement) {
  let prepend!: () => void;
  let listApi: VirtualListApi<string> | null = null;
  let tableApi: VirtualTableApi<string> | null = null;
  function Fixture() {
    const rows = state(['a', 'b', '', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    prepend = () => rows.set(['before-a', 'before-b', ...rows()]);
    const current = rows();
    return (
      <>
        <VirtualList
          style={{ height: '84px', overflowY: 'auto' }}
          items={current}
          rowHeight={28}
          overscan={0}
          getKey={(item) => item}
          rowComponent={({ item }) => <span>{item || '(empty)'}</span>}
          apiRef={(next) => {
            listApi = next;
          }}
        />
        <VirtualTable
          style={{ height: '112px', overflowY: 'auto' }}
          aria-label="Empty key table"
          rows={current}
          rowHeight={28}
          headerHeight={28}
          overscan={0}
          getKey={(row) => row}
          columns={[
            {
              id: 'value',
              header: 'Value',
              cellComponent: ({ row }) => <span>{row || '(empty)'}</span>,
            },
          ]}
          apiRef={(next) => {
            tableApi = next;
          }}
        />
      </>
    );
  }
  mount(<Fixture />, root);
  return {
    scrollToAnchor: async () => {
      listApi?.scrollToIndex(2);
      tableApi?.scrollToIndex(2);
      await flushUpdates();
    },
    prepend: async () => {
      prepend();
      await flushUpdates();
    },
    scrollTops: () => ({
      list: listApi?.getScrollTop(),
      table: tableApi?.getScrollTop(),
    }),
  };
}

export function changedKeyResolver(root: HTMLElement) {
  let rekey!: () => void;
  let prepend!: () => void;
  let listApi: VirtualListApi<string> | null = null;
  let tableApi: VirtualTableApi<string> | null = null;
  function Fixture() {
    const rows = state(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    const prefix = state('old-');
    rekey = () => prefix.set('new-');
    prepend = () => rows.set(['before', ...rows()]);
    const items = rows();
    const keyPrefix = prefix();
    const getKey = (row: string) => keyPrefix + row;
    return (
      <>
        <VirtualList
          style={{ height: '84px', overflowY: 'auto' }}
          items={items}
          rowHeight={28}
          overscan={0}
          getKey={getKey}
          rowComponent={({ item }) => <span>{item}</span>}
          apiRef={(next) => {
            listApi = next;
          }}
        />
        <VirtualTable
          style={{ height: '112px', overflowY: 'auto' }}
          rows={items}
          rowHeight={28}
          headerHeight={28}
          overscan={0}
          getKey={getKey}
          columns={[
            {
              id: 'value',
              header: 'Value',
              cellComponent: ({ row }) => <span>{row}</span>,
            },
          ]}
          apiRef={(next) => {
            tableApi = next;
          }}
        />
      </>
    );
  }
  mount(<Fixture />, root);
  return {
    rekey: async () => {
      rekey();
      await flushUpdates();
    },
    prepend: async () => {
      prepend();
      await flushUpdates();
    },
    scroll: async () => {
      listApi?.scrollToIndex(2);
      tableApi?.scrollToIndex(2);
      await flushUpdates();
    },
    select: async () => {
      tableApi?.selectRowByKey('new-c');
      await flushUpdates();
      return {
        key: tableApi?.getSelectedRowKey(),
        index: tableApi?.getSelectedRowIndex(),
      };
    },
    scrollTops: () => ({
      list: listApi?.getScrollTop(),
      table: tableApi?.getScrollTop(),
    }),
  };
}

export function discardedKeyResolver(root: HTMLElement) {
  let rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  let proposed = false;
  let rejected = false;
  let insertSibling = false;
  let listApi: VirtualListApi<string> | null = null;
  let tableApi: VirtualTableApi<string> | null = null;
  const counts = {
    listNode: 0,
    listNodeNull: 0,
    listApi: 0,
    listApiNull: 0,
    tableNode: 0,
    tableNodeNull: 0,
    tableApi: 0,
    tableApiNull: 0,
  };
  const listRef = (node: HTMLElement | null) => {
    if (node) counts.listNode++;
    else counts.listNodeNull++;
  };
  const tableRef = (node: HTMLElement | null) => {
    if (node) counts.tableNode++;
    else counts.tableNodeNull++;
  };
  const listApiRef = (api: VirtualListApi<string> | null) => {
    listApi = api;
    if (api) counts.listApi++;
    else counts.listApiNull++;
  };
  const tableApiRef = (api: VirtualTableApi<string> | null) => {
    tableApi = api;
    if (api) counts.tableApi++;
    else counts.tableApiNull++;
  };
  const oldKey = (row: string) => 'old-' + row;
  const newKey = (row: string) => 'new-' + row;
  const rowComponent = ({ item }: { item: string }) => <span>{item}</span>;
  const dataColumns = [
    {
      id: 'value',
      header: 'Value',
      cellComponent: ({ row }: { row: string }) => <span>{row}</span>,
    },
  ];
  function Rejection() {
    if (rejected) throw Error('discarded key resolver');
    return <span />;
  }
  function Root() {
    return (
      <div>
        <VirtualList
          items={rows}
          getKey={proposed ? newKey : oldKey}
          rowHeight={28}
          overscan={0}
          rowComponent={rowComponent}
          style={{ height: '84px', overflowY: 'auto' }}
          ref={listRef}
          apiRef={listApiRef}
        />
        <VirtualTable
          aria-label="Retained keys"
          rows={rows}
          getKey={proposed ? newKey : oldKey}
          rowHeight={28}
          headerHeight={28}
          overscan={0}
          columns={dataColumns}
          style={{ height: '112px', overflowY: 'auto' }}
          ref={tableRef}
          apiRef={tableApiRef}
        />
        <div data-testid="insertion-host">
          {insertSibling ? <span>Proposal</span> : null}
        </div>
        <Rejection />
      </div>
    );
  }
  const container = document.createElement('div');
  root.appendChild(container);
  createIsland({ root: container, component: Root });
  return {
    counts: () => ({ ...counts }),
    scroll: async () => {
      listApi?.scrollToIndex(2);
      tableApi?.selectRowByKey('old-c');
      tableApi?.scrollToIndex(2);
      await flushUpdates();
    },
    selected: () => ({
      key: tableApi?.getSelectedRowKey(),
      index: tableApi?.getSelectedRowIndex(),
    }),
    scrollTops: () => ({
      list: listApi?.getScrollTop(),
      table: tableApi?.getScrollTop(),
    }),
    reject: (phase: 'render' | 'structural') => {
      proposed = true;
      rejected = phase === 'render';
      insertSibling = phase === 'structural';
      const host = container.querySelector('[data-testid="insertion-host"]')!;
      const original = host.insertBefore;
      if (phase === 'structural')
        host.insertBefore = () => {
          throw Error('discarded key resolver');
        };
      let message: string | null = null;
      try {
        createIsland({ root: container, component: Root });
      } catch (error) {
        message = error instanceof Error ? error.message : String(error);
      } finally {
        proposed = false;
        rejected = false;
        insertSibling = false;
        host.insertBefore = original;
      }
      return message;
    },
    prepend: async () => {
      proposed = false;
      rows = ['z', ...rows];
      createIsland({ root: container, component: Root });
      await flushUpdates();
    },
    unmount: () => unmount(container),
  };
}

export function rejectedVirtualProperties(root: HTMLElement) {
  let proposed = false;
  let rejected = false;
  let insertSibling = false;
  let listApi: VirtualListApi<string> | null = null;
  let tableApi: VirtualTableApi<string> | null = null;
  const events: Array<string> = [];
  const rows = ['a', 'b', 'c', 'd'];
  const key = (row: string) => row;
  const oldListScroll = () => events.push('old-list-scroll');
  const newListScroll = () => events.push('new-list-scroll');
  const oldTableScroll = () => events.push('old-table-scroll');
  const newTableScroll = () => events.push('new-table-scroll');
  const oldSelection = () => events.push('old-selection');
  const newSelection = () => events.push('new-selection');
  const listApiRef = (api: typeof listApi) => {
    listApi = api;
  };
  const tableApiRef = (api: typeof tableApi) => {
    tableApi = api;
  };
  function Rejection() {
    if (rejected) throw Error('discarded virtual properties');
    return <span />;
  }
  const Root = () => (
    <div>
      <VirtualList
        items={rows}
        getKey={key}
        rowHeight={proposed ? 56 : 28}
        rowComponent={({ item }) => <span>{item}</span>}
        apiRef={listApiRef}
        onScroll={proposed ? newListScroll : oldListScroll}
        style={{ height: '56px', overflowY: 'auto' }}
      />
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
        apiRef={tableApiRef}
        onScroll={proposed ? newTableScroll : oldTableScroll}
        onSelectedRowKeyChange={proposed ? newSelection : oldSelection}
        style={{ height: '84px', overflowY: 'auto' }}
      />
      <div data-testid="insertion-host">
        {insertSibling ? <span>Proposal</span> : null}
      </div>
      <Rejection />
    </div>
  );
  const container = document.createElement('div');
  root.appendChild(container);
  createIsland({ root: container, component: Root });
  return {
    geometry: () => ({
      list: listApi?.getState().totalHeight,
      table: tableApi?.getState().totalHeight,
    }),
    reject: (phase: 'render' | 'structural') => {
      proposed = true;
      rejected = phase === 'render';
      insertSibling = phase === 'structural';
      const host = container.querySelector('[data-testid="insertion-host"]')!;
      const original = host.insertBefore;
      if (phase === 'structural')
        host.insertBefore = () => {
          throw Error('discarded virtual properties');
        };
      let message: string | null = null;
      try {
        createIsland({ root: container, component: Root });
      } catch (error) {
        message = error instanceof Error ? error.message : String(error);
      } finally {
        host.insertBefore = original;
        proposed = false;
        rejected = false;
        insertSibling = false;
      }
      events.length = 0;
      return message;
    },
    scrollCallbacks: () => {
      events.length = 0;
      container
        .querySelector('[data-slot="virtual-list"]')!
        .dispatchEvent(new Event('scroll'));
      container
        .querySelector('[data-slot="virtual-table"]')!
        .dispatchEvent(new Event('scroll'));
      return [...events];
    },
    selectCallback: () => {
      events.length = 0;
      tableApi?.selectRowByKey('b');
      return [...events];
    },
  };
}
