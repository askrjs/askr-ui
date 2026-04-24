import { describe, it } from 'vite-plus/test';
import {
  DataTableContent,
  DataTablePagination,
  DataTableRoot,
  DataTableSearch,
  DataTableToolbar,
  column,
  createDataTable,
} from '../../../src/components/patterns/data-table';
import { expectDeterministicRender } from '../../determinism';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const users: User[] = [
  { id: '1', name: 'Charlie', email: 'charlie@example.com', role: 'editor' },
  { id: '2', name: 'Alice', email: 'alice@example.com', role: 'admin' },
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
        <DataTableSearch placeholder="Search users" debounceMs={0} />
      </DataTableToolbar>
      <DataTableContent key="content">
        <table>
          <thead key="head">
            <tr>
              <th key="name" data-column-id="name">
                <button type="button">Name</button>
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

describe('DataTable - Determinism', () => {
  it('renders stable markup across repeated mounts', () => {
    expectDeterministicRender(() => <TableFixture />);
  });
});
