import { CspNonceScope, state } from '@askrjs/askr';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  VirtualTable,
  type VirtualTableApi,
  type VirtualTableColumn,
} from '../../../../src/components/virtual-table';
import { flushUpdates, mount, unmount } from '../../test-utils';

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

describe('VirtualTable - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should release generated layout rules after unmount', async () => {
    const nonce = 'dmlydHVhbC10YWJsZS1ub25jZQ';
    container = mount(
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

    expect(dynamicStyles()).toContain(
      'data-askr-virtual-table-row-height="43"'
    );
    expect(dynamicStyles()).toContain(
      'data-askr-virtual-table-header-height="43"'
    );
    expect(dynamicStyles()).toContain(
      'data-askr-virtual-table-column-width="173px"'
    );
    expect(
      container
        .querySelector('[data-slot="virtual-table-header-cell"]')
        ?.getBoundingClientRect().height
    ).toBe(43);
    expect(
      Array.from(
        document.querySelectorAll<HTMLStyleElement>(
          'style[data-askr-dynamic-styles]'
        )
      ).some(
        (style) =>
          style.nonce === nonce &&
          style.textContent?.includes('data-askr-virtual-table-row-height="43"')
      )
    ).toBe(true);

    unmount(container);
    container = undefined;
    await Promise.resolve();

    expect(dynamicStyles()).not.toContain(
      'data-askr-virtual-table-row-height="43"'
    );
    expect(dynamicStyles()).not.toContain(
      'data-askr-virtual-table-header-height="43"'
    );
    expect(dynamicStyles()).not.toContain(
      'data-askr-virtual-table-column-width="173px"'
    );
  });

  it('should render a sticky-headed virtual table and support keyboard selection', async () => {
    const onRowClick = vi.fn();
    let api: VirtualTableApi<Row> | null = null;

    container = mount(
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
      />
    );
    await flushUpdates();

    const table = container.querySelector(
      '[data-slot="virtual-table-table"]'
    ) as HTMLTableElement | null;
    const root = container.querySelector(
      '[data-slot="virtual-table"]'
    ) as HTMLElement | null;
    const firstRow = container.querySelector(
      '[data-row-key="row-0"]'
    ) as HTMLTableRowElement | null;

    expect(table?.getAttribute('role')).toBe('grid');
    expect(table?.getAttribute('aria-rowcount')).toBe('11');
    expect(
      container
        .querySelector('[data-slot="virtual-table-header-row"]')
        ?.getAttribute('aria-rowindex')
    ).toBe('1');
    expect(
      container.querySelectorAll('[data-slot="virtual-table-row"]')
    ).toHaveLength(4);
    const mountedRows = Array.from(
      container.querySelectorAll('[data-slot="virtual-table-row"]')
    );
    expect(mountedRows.at(-1)?.getAttribute('data-terminal-row')).toBeNull();
    expect(firstRow?.getAttribute('aria-selected')).toBe('false');
    expect(firstRow?.getAttribute('aria-rowindex')).toBe('2');
    expect(root?.getAttribute('data-at-top')).toBe('true');
    expect(root?.getAttribute('data-at-bottom')).toBe('false');
    expect(root?.getAttribute('data-empty')).toBe('false');

    if (root) {
      root.scrollTop = 1;
      root.dispatchEvent(new Event('scroll'));
      await flushUpdates();
      expect(root.getAttribute('data-at-top')).toBe('false');

      root.scrollTop = 0;
      root.dispatchEvent(new Event('scroll'));
      await flushUpdates();
    }

    firstRow?.click();
    await flushUpdates();

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(api?.getSelectedRowKey()).toBe('row-0');
    expect(firstRow?.getAttribute('aria-selected')).toBe('true');

    table?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    await flushUpdates();

    expect(api?.getSelectedRowIndex()).toBe(1);
    expect(
      container
        .querySelector('[data-row-key="row-1"]')
        ?.getAttribute('aria-selected')
    ).toBe('true');

    api?.scrollToBottom();
    await flushUpdates();

    expect(api?.isAtBottom()).toBe(true);
    expect(container.querySelector('[data-row-key="row-9"]')).toHaveAttribute(
      'data-terminal-row',
      'true'
    );
    expect(root?.getAttribute('data-at-bottom')).toBe('true');
  });

  it('should preserve nested interactive cell behavior without selecting its row', async () => {
    let api: VirtualTableApi<Row> | null = null;
    const onCellAction = vi.fn();

    container = mount(
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
      />
    );
    await flushUpdates();

    const action = container.querySelector(
      '[data-row-key="row-0"] button'
    ) as HTMLButtonElement;
    action.focus();
    action.click();
    await flushUpdates();

    expect(onCellAction).toHaveBeenCalledWith('row-0');
    expect(api?.getSelectedRowKey()).toBeNull();
    expect(document.activeElement).toBe(action);

    action.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    await flushUpdates();

    expect(api?.getSelectedRowKey()).toBeNull();
    expect(document.activeElement).toBe(action);
  });

  it('should honor default-prevented nested events before selecting a row', async () => {
    let api: VirtualTableApi<Row> | null = null;

    container = mount(
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
      />
    );
    await flushUpdates();

    const target = container.querySelector(
      '[data-row-key="row-0"] [data-prevent-table-event]'
    ) as HTMLElement;
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(clickEvent);
    await flushUpdates();

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(api?.getSelectedRowKey()).toBeNull();

    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(keyEvent);
    await flushUpdates();

    expect(keyEvent.defaultPrevented).toBe(true);
    expect(api?.getSelectedRowKey()).toBeNull();
  });

  it('should let a caller prevent the table keyboard behavior', async () => {
    let api: VirtualTableApi<Row> | null = null;
    const onKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });

    container = mount(
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
      />
    );
    await flushUpdates();

    const table = container.querySelector(
      '[data-slot="virtual-table-table"]'
    ) as HTMLTableElement;
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    table.dispatchEvent(keyEvent);
    await flushUpdates();

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(keyEvent.defaultPrevented).toBe(true);
    expect(api?.getSelectedRowKey()).toBeNull();
  });

  it('should map typed viewport and table width affordances to stable data attributes', async () => {
    container = mount(
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
      />
    );
    await flushUpdates();

    const table = container.querySelector('[data-slot="virtual-table"]');

    expect(table?.getAttribute('data-viewport')).toBe('lg');
    expect(table?.getAttribute('data-table-width')).toBe('compact');
  });

  it('should expose the empty scroll-edge state to themes', async () => {
    container = mount(
      <VirtualTable
        aria-label="Users"
        style={{ height: '120px', overflowY: 'auto' }}
        rows={[]}
        rowHeight={24}
        headerHeight={24}
        getKey={(row: Row) => row.id}
        columns={columns}
      />
    );
    await flushUpdates();

    const root = container.querySelector('[data-slot="virtual-table"]');

    expect(root?.getAttribute('data-at-top')).toBe('true');
    expect(root?.getAttribute('data-at-bottom')).toBe('true');
    expect(root?.getAttribute('data-empty')).toBe('true');
  });

  it('should support asChild composition on the wrapper host', async () => {
    container = mount(
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
      </VirtualTable>
    );
    await flushUpdates();

    const host = container.querySelector('section');
    const table = container.querySelector('table');

    expect(host?.getAttribute('data-slot')).toBe('virtual-table');
    expect(table?.getAttribute('data-slot')).toBe('virtual-table-table');
    expect(table?.querySelectorAll('tr')).toHaveLength(5);
  });

  it('should forward user scroll handlers from the virtual wrapper', async () => {
    const onScroll = vi.fn();
    let api: VirtualTableApi<Row> | null = null;

    container = mount(
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
      />
    );
    await flushUpdates();

    const wrapper = container.querySelector(
      '[data-slot="virtual-table"]'
    ) as HTMLElement | null;

    expect(onScroll).not.toHaveBeenCalled();

    if (wrapper) {
      wrapper.scrollTop = 72;
      wrapper.dispatchEvent(new Event('scroll', { bubbles: true }));
    }
    await flushUpdates();

    expect(onScroll).toHaveBeenCalledTimes(1);
    // Firefox can expose a subpixel scroll offset after layout. The public
    // contract is the requested logical position, not engine-specific rounding.
    expect(api?.getScrollTop()).toBeCloseTo(72, 0);
  });

  it('should clamp a pending scroll commit when its dataset is replaced', async () => {
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

    container = mount(<FilterableTable />);
    await flushUpdates();

    api?.scrollToIndex(4_000, 'start');
    replaceRows?.();
    await flushUpdates();
    await flushUpdates();

    const wrapper = container.querySelector(
      '[data-slot="virtual-table"]'
    ) as HTMLElement;
    const maximumScrollTop = 24 + (20 * 24 - (120 - 24));

    expect(api?.getRowCount()).toBe(20);
    expect(api?.getScrollTop()).toBeLessThanOrEqual(maximumScrollTop);

    await nextAnimationFrame();

    expect(api?.getScrollTop()).toBeLessThanOrEqual(maximumScrollTop);
    expect(wrapper.scrollTop).toBeLessThanOrEqual(maximumScrollTop);
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
        <VirtualTable
          aria-label="Resizable users"
          style={{ height: '120px', overflowY: 'auto' }}
          rows={createRows(1_000)}
          rowHeight={24}
          headerHeight={24}
          getKey={(row) => row.id}
          columns={columns}
        />
      );
      await flushUpdates();

      const wrapper = container.querySelector(
        '[data-slot="virtual-table"]'
      ) as HTMLElement;
      wrapper.scrollTop = 10_000;
      wrapper.dispatchEvent(new Event('scroll', { bubbles: true }));

      for (const height of [0, 50, 400, 1, 10_000, 0, 300]) {
        wrapper.style.height = `${height}px`;
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
    const overflowColumns: readonly VirtualTableColumn<Row>[] = [
      {
        id: 'name',
        header: 'Name',
        cellComponent: ({ row }) => (
          <div style={{ height: '200px' }}>{row.name}</div>
        ),
      },
    ];

    container = mount(
      <VirtualTable
        aria-label="Overflowing users"
        style={{ height: '72px', overflowY: 'auto' }}
        rows={createRows(2)}
        rowHeight={24}
        headerHeight={24}
        getKey={(row) => row.id}
        columns={overflowColumns}
      />
    );
    await flushUpdates();

    const rows = Array.from(
      container.querySelectorAll<HTMLElement>('[data-slot="virtual-table-row"]')
    );
    const firstCell = rows[0].querySelector<HTMLElement>(
      '[data-slot="virtual-table-cell"]'
    );
    const firstCellContent = rows[0].querySelector<HTMLElement>(
      '[data-slot="virtual-table-cell-content"]'
    );
    const firstBox = rows[0].getBoundingClientRect();
    const secondBox = rows[1].getBoundingClientRect();

    expect(firstCell && getComputedStyle(firstCell).overflowY).toBe('hidden');
    expect(
      firstCellContent && getComputedStyle(firstCellContent).overflowY
    ).toBe('hidden');
    expect(firstBox.height).toBeCloseTo(24, 0);
    expect(secondBox.top - firstBox.top).toBeCloseTo(24, 0);
  });
});
