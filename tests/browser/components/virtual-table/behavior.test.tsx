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

describe('VirtualTable - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should renders a sticky-headed virtual table and supports keyboard selection', async () => {
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
    const firstRow = container.querySelector(
      '[data-row-key="row-0"]'
    ) as HTMLTableRowElement | null;

    expect(table?.getAttribute('aria-rowcount')).toBe('10');
    expect(
      container.querySelectorAll('[data-slot="virtual-table-row"]')
    ).toHaveLength(4);
    expect(firstRow?.getAttribute('aria-selected')).toBe('false');

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
    expect(container.querySelector('[data-row-key="row-9"]')).toBeTruthy();
  });

  it('should supports asChild composition on the wrapper host', async () => {
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
    expect(api?.getScrollTop()).toBe(72);
  });
});
