import { bench, describe } from 'vite-plus/test';
import { VirtualTable } from '../../src/components/virtual-table';

type Row = {
  id: string;
  name: string;
  email: string;
};

const rows: Row[] = Array.from({ length: 100 }, (_, index) => ({
  id: `row-${index}`,
  name: `User ${index}`,
  email: `user-${index}@example.com`,
}));

const columns = [
  {
    id: 'name',
    header: 'Name',
    cellComponent: ({ row }: { row: Row }) => <span>{row.name}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    cellComponent: ({ row }: { row: Row }) => <span>{row.email}</span>,
  },
] as const;

describe('VirtualTable benches', () => {
  bench('create virtual table', () => {
    <VirtualTable
      aria-label="Users"
      rows={rows}
      rowHeight={24}
      headerHeight={24}
      getKey={(row) => row.id}
      columns={columns}
    />;
  });
});
