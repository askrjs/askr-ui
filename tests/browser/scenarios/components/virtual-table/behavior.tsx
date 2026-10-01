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

export async function nestedInteractiveCell(root: HTMLElement) {
  let api: VirtualTableApi<Row> | null = null;
  const onCellAction = spy<[string]>();

  mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={createRows(4)}
      rowHeight={40}
      headerHeight={40}
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

  return {
    actionArgs: () => onCellAction.calls.map(([id]) => id),
    selectedRowKey: () => api?.getSelectedRowKey() ?? null,
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

  api?.scrollToIndex(4_000, 'start');
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
