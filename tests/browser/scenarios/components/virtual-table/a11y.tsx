import { VirtualTable } from '../../../../../src/components/virtual-table';
import { mount } from '../../_mount';

type Row = {
  id: string;
  name: string;
  email: string;
};

const rows: Row[] = [
  { id: 'row-0', name: 'Ada', email: 'ada@example.com' },
  { id: 'row-1', name: 'Grace', email: 'grace@example.com' },
  { id: 'row-2', name: 'Linus', email: 'linus@example.com' },
];

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

export function axeSelectableGrid(root: HTMLElement): void {
  mount(
    <VirtualTable
      aria-label="Users"
      style={{ height: '120px', overflowY: 'auto' }}
      rows={rows}
      rowHeight={24}
      headerHeight={24}
      getKey={(row) => row.id}
      columns={columns}
    />,
    root
  );
}
