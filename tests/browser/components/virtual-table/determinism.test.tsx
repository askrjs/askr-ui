import { describe, it, vi } from 'vite-plus/test';
import { expectDeterministicRender } from '../../determinism';
import { VirtualTable } from '../../../../src/components/virtual-table';

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

describe('VirtualTable - Determinism', () => {
  it('renders deterministic virtual table markup', () => {
    vi.useFakeTimers();

    try {
      expectDeterministicRender(() => (
        <VirtualTable
          aria-label="Users"
          style={{ height: '120px', overflowY: 'auto' }}
          rows={rows}
          rowHeight={24}
          headerHeight={24}
          getKey={(row) => row.id}
          columns={columns}
        />
      ));
    } finally {
      vi.useRealTimers();
    }
  });
});
