import { describe, expect, it } from 'vite-plus/test';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { VirtualList } from '../../src/components/virtual-list';
import {
  VirtualTable,
  type VirtualTableColumn,
} from '../../src/components/virtual-table';

type Row = { id: string; name: string };

const rows: readonly Row[] = [
  { id: 'one', name: 'One' },
  { id: 'two', name: 'Two' },
  { id: 'three', name: 'Three' },
];

const columns: readonly VirtualTableColumn<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    width: 173,
    cellComponent: ({ row }) => <span>{row.name}</span>,
  },
];

function renderWithStyles(component: () => JSX.Element) {
  let styles = '';
  const html = renderToStringSync(
    component,
    {},
    {
      cspNonce: 'c3NyLXZpcnR1YWxpemF0aW9u',
      onContext: (context) => {
        styles = Array.from(context.ssrStyles.values())
          .map(({ cssText }) => cssText)
          .join('\n');
      },
    }
  );
  return { html, styles };
}

describe('virtualization SSR styles', () => {
  it('should register virtual-list geometry before hydration', () => {
    const { html, styles } = renderWithStyles(() => (
      <VirtualList
        aria-label="Messages"
        style={{ height: '60px', overflowY: 'auto' }}
        items={rows}
        rowHeight={20}
        getKey={(row) => row.id}
        rowComponent={({ item }) => <span>{item.name}</span>}
      />
    ));

    expect(html).toContain('data-askr-virtual-list-row-height="20"');
    expect(styles).toContain(
      '[data-askr-virtual-list-row-height="20"] { height: 20px;'
    );
  });

  it('should register virtual-table geometry before hydration', () => {
    const { html, styles } = renderWithStyles(() => (
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

    expect(html).toContain('data-askr-virtual-table-row-height="24"');
    expect(styles).toContain(
      '[data-askr-virtual-table-row-height="24"] { height: 24px;'
    );
    expect(styles).toContain(
      '[data-askr-virtual-table-column-width="173px"] { width: 173px;'
    );
    expect(styles).toContain('[data-askr-virtual-table-table-layout="fixed"]');
  });
});
