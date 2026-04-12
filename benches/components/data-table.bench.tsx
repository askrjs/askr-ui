import { bench, describe } from 'vite-plus/test';
import {
  DataTableContent,
  DataTablePagination,
  DataTableRoot,
  DataTableSearch,
  DataTableToolbar,
  createDataTable,
  column,
} from '../../src/components/patterns/data-table';
import { mount, unmount } from '../../tests/test-utils';

type BenchRow = {
  id: string;
  name: string;
  email: string;
  team: string;
  score: number;
  status: 'active' | 'paused';
};

const benchColumns = [
  column<BenchRow>({
    id: 'name',
    header: 'Name',
    accessor: (row) => row.name,
    sortable: true,
    filterable: true,
    mobile: { priority: 1 },
  }),
  column<BenchRow>({
    id: 'email',
    header: 'Email',
    accessor: (row) => row.email,
    filterable: true,
    mobile: { priority: 2 },
  }),
  column<BenchRow>({
    id: 'team',
    header: 'Team',
    accessor: (row) => row.team,
    filterable: true,
    mobile: { priority: 3 },
  }),
  column<BenchRow>({
    id: 'score',
    header: 'Score',
    accessor: (row) => row.score,
    sortable: true,
  }),
  column<BenchRow>({
    id: 'status',
    header: 'Status',
    accessor: (row) => row.status,
    filterable: true,
    mobile: { priority: 4 },
  }),
];

function buildRows(count: number): BenchRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    team: ['Core', 'Platform', 'Design', 'QA'][index % 4],
    score: 1000 - index,
    status: index % 3 === 0 ? 'paused' : 'active',
  }));
}

function mountTableScenario(options: {
  rowCount: number;
  mode: 'table' | 'list';
  globalFilter?: string;
}) {
  const rows = buildRows(options.rowCount);

  function BenchTable() {
    const table = createDataTable<BenchRow>({
      data: () => rows,
      getRowId: (row) => row.id,
      columns: benchColumns,
      sorting: {
        defaultValue: [{ id: 'score', desc: true }],
      },
      filtering: {
        defaultValue: {
          global: options.globalFilter ?? '',
          columns: {},
        },
      },
      pagination: {
        defaultValue: { page: 2, pageSize: 25 },
      },
      responsive: { mode: options.mode },
      mobileRow: {
        primary: (row) => row.name,
        secondary: [(row) => row.email, (row) => row.team],
        meta: [(row) => row.status, (row) => row.score],
      },
    });

    return (
      <DataTableRoot table={table}>
        <DataTableToolbar>
          <DataTableSearch debounceMs={0} placeholder="Search rows" />
        </DataTableToolbar>
        <DataTableContent />
        <DataTablePagination />
      </DataTableRoot>
    );
  }

  const container = mount(<BenchTable />);
  unmount(container);
}

function mountPipelineScenario(rowCount: number) {
  const rows = buildRows(rowCount);

  function BenchPipeline() {
    const table = createDataTable<BenchRow>({
      data: () => rows,
      getRowId: (row) => row.id,
      columns: benchColumns,
      sorting: {
        defaultValue: [{ id: 'name', desc: false }],
      },
      filtering: {
        defaultValue: {
          global: 'User 1',
          columns: { status: 'active' },
        },
      },
      pagination: {
        defaultValue: { page: 1, pageSize: 20 },
      },
      responsive: { mode: 'table' },
    });

    table.getFilteredRows();
    table.getSortedRows();
    table.getPageRows();

    return <div data-count={table.getPageRows().length} />;
  }

  const container = mount(<BenchPipeline />);
  unmount(container);
}

describe('DataTable benches', () => {
  bench('mount table mode with 250 rows', () => {
    mountTableScenario({ rowCount: 250, mode: 'table' });
  });

  bench('mount list mode with 250 rows', () => {
    mountTableScenario({ rowCount: 250, mode: 'list' });
  });

  bench('run filtered and sorted pipeline for 500 rows', () => {
    mountPipelineScenario(500);
  });
});