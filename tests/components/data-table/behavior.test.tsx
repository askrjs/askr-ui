import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  DataTableContent,
  DataTablePagination,
  DataTableRoot,
  DataTableSearch,
  DataTableToolbar,
  column,
  createDataTable,
} from '../../../src/components/patterns/data-table';
import { flushUpdates, mount, unmount } from '../../test-utils';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const users: User[] = [
  { id: '1', name: 'Charlie', email: 'charlie@example.com', role: 'editor' },
  { id: '2', name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: '3', name: 'Bob', email: 'bob@example.com', role: 'viewer' },
];

const columns = [
  column<User>({
    id: 'name',
    header: 'Name',
    accessor: (row) => row.name,
    sortable: true,
    mobile: { priority: 1 },
  }),
  column<User>({
    id: 'email',
    header: 'Email',
    accessor: (row) => row.email,
    filterable: true,
    mobile: { priority: 2 },
  }),
  column<User>({
    id: 'role',
    header: 'Role',
    accessor: (row) => row.role,
    mobile: { priority: 3 },
  }),
];

function TableFixture() {
  const table = createDataTable<User>({
    data: () => users,
    getRowId: (row) => row.id,
    columns,
    sorting: true,
    filtering: true,
    pagination: { pageSize: 1 },
  });

  table.getSelection();
  table.getExpanded();
  table.getColumnVisibility();

  return (
    <DataTableRoot table={table}>
      <DataTableToolbar key="toolbar">
        <DataTableSearch placeholder="Search users" debounceMs={25} />
      </DataTableToolbar>
      <DataTableContent key="content">
        <table>
          <thead key="head">
            <tr>
              <th
                key="name"
                aria-sort={table.getColumnSortDirection('name') || undefined}
                data-column-id="name"
              >
                <button type="button" onClick={() => table.toggleSort('name')}>
                  Name
                </button>
              </th>
              <th key="email" data-column-id="email">
                Email
              </th>
              <th key="role" data-column-id="role">
                Role
              </th>
            </tr>
          </thead>
          <tbody key="body">
            {table.getPageRows().map((row) => (
              <tr key={row.id} data-row-id={row.id}>
                <td key="name">{row.getCellValue('name')}</td>
                <td key="email">{row.getCellValue('email')}</td>
                <td key="role">{row.getCellValue('role')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableContent>
      <DataTablePagination key="pagination" />
    </DataTableRoot>
  );
}

describe('DataTable - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('sorts rows when the header trigger is activated', async () => {
    container = mount(<TableFixture />);
    await flushUpdates();

    const sortTrigger = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Name'
    ) as HTMLButtonElement;

    sortTrigger.click();
    await flushUpdates();

    const firstRow = container.querySelector('[data-row-id]') as HTMLElement;

    expect(firstRow.textContent).toContain('Alice');
    expect(
      container
        .querySelector('[data-column-id="name"]')
        ?.getAttribute('aria-sort')
    ).toBe('asc');
  });

  it('paginates rows through the default controls', async () => {
    container = mount(<TableFixture />);
    await flushUpdates();

    const nextButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.getAttribute('aria-label') === 'Next page'
    ) as HTMLButtonElement;

    expect(container.textContent).toContain('Charlie');

    nextButton.click();
    await flushUpdates();

    expect(container.textContent).toContain('Alice');
    expect(container.textContent).toContain('Page 2 of 3');
  });

  it('debounces search input before filtering rows', async () => {
    vi.useFakeTimers();

    try {
      container = mount(<TableFixture />);
      await flushUpdates();

      const search = container.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;

      search.value = 'Bob';
      search.dispatchEvent(new Event('input', { bubbles: true }));

      expect(container.textContent).not.toContain('Bob');

      vi.advanceTimersByTime(25);
      await flushUpdates();

      expect(container.textContent).toContain('Bob');
      expect(container.textContent).toContain('Page 1 of 1');
    } finally {
      vi.useRealTimers();
    }
  });
});
